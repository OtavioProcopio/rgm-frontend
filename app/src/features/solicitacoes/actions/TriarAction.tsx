import { AvisoFotoNaoEnviada } from '@/features/evidencias/components/AvisoFotoNaoEnviada';
import { useResponsaveisDisponiveis } from '@/features/admin/usuarios/hooks/useResponsaveisDisponiveis';

import { TriagemModal } from '../components/TriagemModal';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { acaoFeitaSemFoto } from '../lib/solicitacaoMessages';
import { useTriarSolicitacao } from '../hooks/useTriarSolicitacao';
import { AcaoErro } from './AcaoErro';
import type { AcaoProps } from '../types/acaoProps';

export function TriarAction({ solicitacao, onClose }: AcaoProps) {
  const triar = useTriarSolicitacao(solicitacao.id);
  const { responsaveis } = useResponsaveisDisponiveis();
  const { erro, aviso, executar } = useExecutarAcao(solicitacao.id, onClose);

  if (aviso) return <AvisoFotoNaoEnviada {...aviso} onSair={onClose} />;

  return (
    <>
      <TriagemModal
        isPending={triar.isPending}
        usuarios={responsaveis}
        onCancel={onClose}
        onConfirm={(data, foto, nota) =>
          executar(() => triar.mutateAsync(data), {
            file: foto,
            tipo: 'INSTRUCAO_SERVICO',
            feito: acaoFeitaSemFoto.TRIAR,
            descricao: nota || undefined,
          })
        }
      />
      <AcaoErro mensagem={erro} />
    </>
  );
}
