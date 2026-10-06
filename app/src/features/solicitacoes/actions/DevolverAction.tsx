import { AvisoFotoNaoEnviada } from '@/features/evidencias/components/AvisoFotoNaoEnviada';

import { DevolucaoModal } from '../components/DevolucaoModal';
import { useDevolverSolicitacao } from '../hooks/useDevolverSolicitacao';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { acaoFeitaSemFoto } from '../lib/solicitacaoMessages';
import { AcaoAvisos } from './AcaoAvisos';
import type { AcaoProps } from '../types/acaoProps';

export function DevolverAction({ solicitacao, onClose, onCancelar }: AcaoProps) {
  const devolver = useDevolverSolicitacao(solicitacao.id);
  const { erro, aviso, atualizadaPorOutro, executar } = useExecutarAcao(solicitacao.id, onClose);

  if (aviso) return <AvisoFotoNaoEnviada {...aviso} onSair={onClose} />;

  return (
    <>
      <DevolucaoModal
        isPending={devolver.isPending}
        onCancel={onCancelar}
        onConfirm={(data, foto) =>
          executar(() => devolver.mutateAsync(data), {
            file: foto,
            tipo: 'DEVOLUCAO',
            feito: acaoFeitaSemFoto.DEVOLVER,
            descricao: data.motivo,
          })
        }
      />
      <AcaoAvisos erro={erro} atualizadaPorOutro={atualizadaPorOutro} />
    </>
  );
}
