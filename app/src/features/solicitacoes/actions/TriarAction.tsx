import { useResponsaveisDisponiveis } from '@/features/admin/usuarios/hooks/useResponsaveisDisponiveis';

import { TriagemModal } from '../components/TriagemModal';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { useTriarSolicitacao } from '../hooks/useTriarSolicitacao';
import { AcaoErro } from './AcaoErro';
import type { AcaoProps } from '../types/acaoProps';

export function TriarAction({ solicitacao, onClose }: AcaoProps) {
  const triar = useTriarSolicitacao(solicitacao.id);
  const { responsaveis } = useResponsaveisDisponiveis();
  const { erro, executar } = useExecutarAcao(solicitacao.id, onClose);

  return (
    <>
      <TriagemModal
        isPending={triar.isPending}
        usuarios={responsaveis}
        onCancel={onClose}
        onConfirm={(data, foto, nota) =>
          executar(() => triar.mutateAsync(data), {
            file: foto,
            tipo: 'INSTRUCAO_SERVICO',
            descricao: nota || undefined,
          })
        }
      />
      <AcaoErro mensagem={erro} />
    </>
  );
}
