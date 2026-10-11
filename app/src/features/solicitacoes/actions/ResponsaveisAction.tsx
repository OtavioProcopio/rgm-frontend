import { AlterarResponsaveisModal } from '../components/AlterarResponsaveisModal';
import { useAlterarResponsaveis } from '../hooks/useAlterarResponsaveis';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { sucessoDaAcao } from '../lib/solicitacaoMessages';
import { AcaoAvisos } from './AcaoAvisos';
import type { AcaoProps } from '../types/acaoProps';

export function ResponsaveisAction({ solicitacao, onClose, onCancelar }: AcaoProps) {
  const alterar = useAlterarResponsaveis(solicitacao.id);
  const atuais = solicitacao.responsavelIds.map((id) => ({
    id,
    nome: solicitacao.responsaveis?.find((r) => r.id === id)?.nome ?? 'Responsável atual',
  }));
  const { erro, atualizadaPorOutro, executar } = useExecutarAcao(solicitacao.id, onClose);

  return (
    <>
      <AlterarResponsaveisModal
        responsaveisAtuais={atuais}
        isPending={alterar.isPending}
        onCancel={onCancelar}
        onConfirm={(responsavelIds) =>
          executar(
            () => alterar.mutateAsync({ responsavelIds }),
            undefined,
            sucessoDaAcao.RESPONSAVEIS,
          )
        }
      />
      <AcaoAvisos erro={erro} atualizadaPorOutro={atualizadaPorOutro} />
    </>
  );
}
