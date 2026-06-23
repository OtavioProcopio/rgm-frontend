import { cn } from '@/shared/lib/cn';

import { prioridadeLabel } from '../lib/solicitacaoMessages';
import type { PrioridadeSolicitacao } from '../types/solicitacaoTypes';

type Props = {
  prioridade: PrioridadeSolicitacao | null;
  className?: string;
};

const prioridadeStyles: Record<PrioridadeSolicitacao, string> = {
  BAIXA: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  MEDIA: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  ALTA: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  URGENTE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export function SolicitacaoPrioridadeBadge({ prioridade, className }: Props) {
  if (!prioridade) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        prioridadeStyles[prioridade],
        className,
      )}
    >
      {prioridadeLabel[prioridade]}
    </span>
  );
}
