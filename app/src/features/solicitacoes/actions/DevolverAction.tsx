import { DevolucaoModal } from '../components/DevolucaoModal';
import { useDevolverSolicitacao } from '../hooks/useDevolverSolicitacao';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { AcaoErro } from './AcaoErro';
import type { AcaoProps } from '../types/acaoProps';

export function DevolverAction({ solicitacao, onClose }: AcaoProps) {
  const devolver = useDevolverSolicitacao(solicitacao.id);
  const { erro, executar } = useExecutarAcao(solicitacao.id, onClose);

  return (
    <>
      <DevolucaoModal
        isPending={devolver.isPending}
        onCancel={onClose}
        onConfirm={(data, foto) =>
          executar(() => devolver.mutateAsync(data), {
            file: foto,
            tipo: 'DEVOLUCAO',
            descricao: data.motivo,
          })
        }
      />
      <AcaoErro mensagem={erro} />
    </>
  );
}
