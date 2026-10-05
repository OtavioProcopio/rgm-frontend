import { EncerramentoModal } from '../components/EncerramentoModal';
import { useCancelarSolicitacao } from '../hooks/useCancelarSolicitacao';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { AcaoErro } from './AcaoErro';
import type { AcaoProps } from '../types/acaoProps';

export function CancelarAction({ solicitacao, onClose }: AcaoProps) {
  const cancelar = useCancelarSolicitacao(solicitacao.id);
  const { erro, executar } = useExecutarAcao(solicitacao.id, onClose);

  return (
    <>
      <EncerramentoModal
        isPending={cancelar.isPending}
        podeConcluir={false}
        onCancel={onClose}
        onConfirm={(data) => executar(() => cancelar.mutateAsync({ motivo: data.comentario }))}
      />
      <AcaoErro mensagem={erro} />
    </>
  );
}
