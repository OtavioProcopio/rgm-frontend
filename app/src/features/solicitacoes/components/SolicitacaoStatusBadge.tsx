import { cn } from '@/shared/lib/cn';

import { statusLabel } from '../lib/solicitacaoMessages';
import type { StatusSolicitacao } from '../types/solicitacaoTypes';

type Props = {
  status: StatusSolicitacao;
  className?: string;
};

const statusStyles: Record<StatusSolicitacao, string> = {
  A_FAZER: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  EM_ANDAMENTO: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  EM_VALIDACAO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  CONCLUIDA: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  CANCELADA: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export function SolicitacaoStatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
        className,
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
