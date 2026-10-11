import { Badge, type BadgeVariant } from '@/shared/components/Badge/Badge';
import { rotuloDoStatus } from '@/shared/lib/rotulos';

import type { StatusSolicitacao } from '../types/solicitacaoTypes';

type Props = {
  status: StatusSolicitacao;
  className?: string;
};

const VARIACAO_DO_STATUS: Record<StatusSolicitacao, BadgeVariant> = {
  A_FAZER: 'neutral',
  EM_ANDAMENTO: 'info',
  EM_VALIDACAO: 'warning',
  CONCLUIDA: 'success',
  CANCELADA: 'danger',
};

export function SolicitacaoStatusBadge({ status, className }: Props) {
  return (
    <Badge variant={VARIACAO_DO_STATUS[status]} className={className}>
      {rotuloDoStatus[status]}
    </Badge>
  );
}
