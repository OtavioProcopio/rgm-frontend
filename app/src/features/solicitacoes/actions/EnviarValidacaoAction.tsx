import { EnviarValidacaoModal } from '../components/EnviarValidacaoModal';
import { useEnviarParaValidacao } from '../hooks/useEnviarParaValidacao';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { AcaoAvisos } from './AcaoAvisos';
import type { AcaoProps } from '../types/acaoProps';

export function EnviarValidacaoAction({ solicitacao, onClose, onCancelar }: AcaoProps) {
  const enviar = useEnviarParaValidacao(solicitacao.id);
  const { erro, atualizadaPorOutro, executar } = useExecutarAcao(solicitacao.id, onClose);

  return (
    <>
      <EnviarValidacaoModal
        solicitacaoId={solicitacao.id}
        isPending={enviar.isPending}
        evidenciaObrigatoria={solicitacao.tipo !== 'CRIACAO'}
        onCancel={onCancelar}
        onConfirm={(data) => executar(() => enviar.mutateAsync(data.comentario))}
      />
      <AcaoAvisos erro={erro} atualizadaPorOutro={atualizadaPorOutro} />
    </>
  );
}
