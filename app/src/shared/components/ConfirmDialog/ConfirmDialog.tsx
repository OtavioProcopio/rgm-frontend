import { Button } from '@/shared/components/Button/Button';

type Variant = 'danger' | 'warning';

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: Variant;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const styles: Record<Variant, { container: string; button: string }> = {
  danger: {
    container:
      'rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-100',
    button:
      'bg-red-600 hover:bg-red-700 focus-visible:outline-red-500 dark:bg-red-600 dark:hover:bg-red-500',
  },
  warning: {
    container:
      'rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100',
    button:
      'bg-amber-600 hover:bg-amber-700 focus-visible:outline-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500',
  },
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  variant = 'danger',
  isPending,
  onCancel,
  onConfirm,
}: Props) {
  const s = styles[variant];

  return (
    <div className={s.container}>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2">{message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="button" onClick={onConfirm} disabled={isPending} className={s.button}>
          {isPending ? 'Aguarde...' : confirmLabel}
        </Button>
      </div>
    </div>
  );
}
