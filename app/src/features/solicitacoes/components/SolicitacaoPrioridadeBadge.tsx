import { Badge, type BadgeVariant } from '@/shared/components/Badge/Badge';
import { rotuloDaPrioridade } from '@/shared/lib/rotulos';

import type { PrioridadeSolicitacao } from '../types/solicitacaoTypes';

type Props = {
  prioridade: PrioridadeSolicitacao | null;
  className?: string;
};

const VARIACAO_DA_PRIORIDADE: Record<PrioridadeSolicitacao, BadgeVariant> = {
  BAIXA: 'neutral',
  MEDIA: 'info',
  ALTA: 'warning',
  URGENTE: 'danger',
};

export function SolicitacaoPrioridadeBadge({ prioridade, className }: Props) {
  if (!prioridade) return null;

  return (
    <Badge variant={VARIACAO_DA_PRIORIDADE[prioridade]} className={className}>
      {rotuloDaPrioridade[prioridade]}
    </Badge>
  );
}
