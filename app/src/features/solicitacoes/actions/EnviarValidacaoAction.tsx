import { EnviarValidacaoModal } from '../components/EnviarValidacaoModal';
import { useEnviarParaValidacao } from '../hooks/useEnviarParaValidacao';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { AcaoErro } from './AcaoErro';
import type { AcaoProps } from '../types/acaoProps';

export function EnviarValidacaoAction({ solicitacao, onClose }: AcaoProps) {
  const enviar = useEnviarParaValidacao(solicitacao.id);
  const { erro, executar } = useExecutarAcao(solicitacao.id, onClose);

  return (
    <>
      <EnviarValidacaoModal
        solicitacaoId={solicitacao.id}
        isPending={enviar.isPending}
        evidenciaObrigatoria={solicitacao.tipo !== 'CRIACAO'}
        onCancel={onClose}
        onConfirm={(data) => executar(() => enviar.mutateAsync(data.comentario))}
      />
      <AcaoErro mensagem={erro} />
    </>
  );
}
