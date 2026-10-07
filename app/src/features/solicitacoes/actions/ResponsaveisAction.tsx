import { useResponsaveisDisponiveis } from '@/features/admin/usuarios/hooks/useResponsaveisDisponiveis';

import { AlterarResponsaveisModal } from '../components/AlterarResponsaveisModal';
import { useAlterarResponsaveis } from '../hooks/useAlterarResponsaveis';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { AcaoAvisos } from './AcaoAvisos';
import type { AcaoProps } from '../types/acaoProps';

export function ResponsaveisAction({ solicitacao, onClose, onCancelar }: AcaoProps) {
  const alterar = useAlterarResponsaveis(solicitacao.id);
  const { responsaveis } = useResponsaveisDisponiveis();
  const { erro, atualizadaPorOutro, executar } = useExecutarAcao(solicitacao.id, onClose);

  return (
    <>
      <AlterarResponsaveisModal
        responsaveisAtuais={solicitacao.responsavelIds}
        usuarios={responsaveis}
        isPending={alterar.isPending}
        onCancel={onCancelar}
        onConfirm={(responsavelIds) => executar(() => alterar.mutateAsync({ responsavelIds }))}
      />
      <AcaoAvisos erro={erro} atualizadaPorOutro={atualizadaPorOutro} />
    </>
  );
}
