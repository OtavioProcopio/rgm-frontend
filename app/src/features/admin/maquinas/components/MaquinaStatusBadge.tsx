import { cn } from '@/shared/lib/cn';

export function MaquinaStatusBadge({ ativa }: { ativa: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-1 text-xs font-semibold',
        ativa
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
      )}
    >
      {ativa ? 'Ativa' : 'Inativa'}
    </span>
  );
}
