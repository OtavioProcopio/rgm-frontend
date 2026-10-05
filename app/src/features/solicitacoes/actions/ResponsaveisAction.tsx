import { useResponsaveisDisponiveis } from '@/features/admin/usuarios/hooks/useResponsaveisDisponiveis';

import { AlterarResponsaveisModal } from '../components/AlterarResponsaveisModal';
import { useAlterarResponsaveis } from '../hooks/useAlterarResponsaveis';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { AcaoErro } from './AcaoErro';
import type { AcaoProps } from '../types/acaoProps';

export function ResponsaveisAction({ solicitacao, onClose }: AcaoProps) {
  const alterar = useAlterarResponsaveis(solicitacao.id);
  const { responsaveis } = useResponsaveisDisponiveis();
  const { erro, executar } = useExecutarAcao(solicitacao.id, onClose);

  return (
    <>
      <AlterarResponsaveisModal
        responsaveisAtuais={solicitacao.responsavelIds}
        usuarios={responsaveis}
        isPending={alterar.isPending}
        onCancel={onClose}
        onConfirm={(responsavelIds) => executar(() => alterar.mutateAsync({ responsavelIds }))}
      />
      <AcaoErro mensagem={erro} />
    </>
  );
}
