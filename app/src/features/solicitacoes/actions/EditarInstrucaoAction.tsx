import { EdicaoDaInstrucaoForm } from '../components/EdicaoDaInstrucaoForm';
import { useEditarInstrucao } from '../hooks/useEditarInstrucao';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { sucessoDaAcao } from '../lib/solicitacaoMessages';
import { AcaoAvisos } from './AcaoAvisos';
import type { AcaoProps } from '../types/acaoProps';

export function EditarInstrucaoAction({ solicitacao, onClose, onCancelar }: AcaoProps) {
  const editar = useEditarInstrucao(solicitacao.id);
  const { erro, atualizadaPorOutro, executar } = useExecutarAcao(solicitacao.id, onClose);

  return (
    <>
      <EdicaoDaInstrucaoForm
        instrucaoAtual={solicitacao.instrucao}
        isPending={editar.isPending}
        onCancel={onCancelar}
        onConfirm={(data) =>
          executar(() => editar.mutateAsync(data), undefined, sucessoDaAcao.EDITAR_INSTRUCAO)
        }
      />
      <AcaoAvisos erro={erro} atualizadaPorOutro={atualizadaPorOutro} />
    </>
  );
}
