import { AvisoFotoNaoEnviada } from '@/features/evidencias/components/AvisoFotoNaoEnviada';

import { useToast } from '@/shared/components/Toast/toastContext';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { TriagemModal } from '../components/TriagemModal';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { acaoFeitaSemFoto, sucessoDaAcao } from '../lib/solicitacaoMessages';
import { useTriarSolicitacao } from '../hooks/useTriarSolicitacao';
import { AcaoAvisos } from './AcaoAvisos';
import type { AcaoProps } from '../types/acaoProps';

export function TriarAction({ solicitacao, onClose, onCancelar }: AcaoProps) {
  const triar = useTriarSolicitacao(solicitacao.id);
  const { avisar } = useToast();
  const { erro, aviso, atualizadaPorOutro, executar } = useExecutarAcao(solicitacao.id, onClose);

  if (aviso) return <AvisoFotoNaoEnviada {...aviso} onSair={onClose} />;

  return (
    <>
      <TriagemModal
        isPending={triar.isPending}
        onCancel={onCancelar}
        onConfirm={(data, foto, nota) =>
          executar(
            async () => {
              await triar.mutateAsync(data);
              // Sem foto, a descrição não tem onde ser guardada: vira comentário da solicitação.
              if (nota.trim() && !foto) {
                try {
                  await solicitacoesApi.comentar(solicitacao.id, { comentario: nota.trim() });
                } catch {
                  avisar('Triada, mas a descrição não foi salva. Registre-a como comentário.');
                }
              }
            },
            {
              file: foto,
              tipo: 'INSTRUCAO_SERVICO',
              feito: acaoFeitaSemFoto.TRIAR,
              descricao: nota || undefined,
            },
            sucessoDaAcao.TRIAR,
          )
        }
      />
      <AcaoAvisos erro={erro} atualizadaPorOutro={atualizadaPorOutro} />
    </>
  );
}
