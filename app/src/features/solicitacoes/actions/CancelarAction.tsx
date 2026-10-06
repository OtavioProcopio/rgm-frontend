import { EncerramentoModal } from '../components/EncerramentoModal';
import { useCancelarSolicitacao } from '../hooks/useCancelarSolicitacao';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { AcaoAvisos } from './AcaoAvisos';
import type { AcaoProps } from '../types/acaoProps';

export function CancelarAction({ solicitacao, onClose }: AcaoProps) {
  const cancelar = useCancelarSolicitacao(solicitacao.id);
  const { erro, atualizadaPorOutro, executar } = useExecutarAcao(solicitacao.id, onClose);

  return (
    <>
      <EncerramentoModal
        isPending={cancelar.isPending}
        podeConcluir={false}
        onCancel={onClose}
        onConfirm={(data) => executar(() => cancelar.mutateAsync({ motivo: data.comentario }))}
      />
      <AcaoAvisos erro={erro} atualizadaPorOutro={atualizadaPorOutro} />
    </>
  );
}
