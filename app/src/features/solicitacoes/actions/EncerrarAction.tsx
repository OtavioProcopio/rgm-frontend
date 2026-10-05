import { EncerramentoModal } from '../components/EncerramentoModal';
import { useCancelarSolicitacao } from '../hooks/useCancelarSolicitacao';
import { useEncerrarSolicitacao } from '../hooks/useEncerrarSolicitacao';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { AcaoErro } from './AcaoErro';
import type { AcaoProps } from '../types/acaoProps';

/** Encerramento de quem valida: conclui a solicitação ou, se o usuário escolher, cancela. */
export function EncerrarAction({ solicitacao, onClose }: AcaoProps) {
  const encerrar = useEncerrarSolicitacao(solicitacao.id);
  const cancelar = useCancelarSolicitacao(solicitacao.id);
  const { erro, executar } = useExecutarAcao(solicitacao.id, onClose);

  return (
    <>
      <EncerramentoModal
        isPending={encerrar.isPending || cancelar.isPending}
        podeConcluir
        onCancel={onClose}
        onConfirm={(data, foto) =>
          data.concluir
            ? executar(() => encerrar.mutateAsync(data), {
                file: foto,
                tipo: 'CONCLUSAO',
                descricao: data.comentario,
              })
            : executar(() => cancelar.mutateAsync({ motivo: data.comentario }))
        }
      />
      <AcaoErro mensagem={erro} />
    </>
  );
}
