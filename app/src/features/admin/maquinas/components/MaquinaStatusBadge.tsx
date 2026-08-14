import { cn } from '@/shared/lib/cn';

type MaquinaStatusBadgeProps = {
  ativo: boolean;
};

export function MaquinaStatusBadge({ ativo }: MaquinaStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-1 text-xs font-semibold',
        ativo
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
      )}
    >
      {ativo ? 'Ativa' : 'Inativa'}
    </span>
  );
}
