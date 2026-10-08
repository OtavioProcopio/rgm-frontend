import type { ReactNode } from 'react';

import { Button } from '@/shared/components/Button/Button';
import { Dialog } from '@/shared/components/Dialog/Dialog';

type Variant = 'danger' | 'warning';

type Props = {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const styles: Record<Variant, { container: string; button: string }> = {
  danger: {
    container: 'rounded-md border border-danger bg-danger-soft p-4 text-sm text-danger-fg',
    button: '',
  },
  warning: {
    container: 'rounded-md border border-warning bg-warning-soft p-4 text-sm text-warning-fg',
    button: 'bg-warning hover:bg-warning hover:brightness-95',
  },
};

/**
 * Confirmação em diálogo modal: montado significa aberto. O botão de desistir vem primeiro
 * para receber o foco inicial; durante o envio, Esc e clique fora não fecham.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isPending,
  onCancel,
  onConfirm,
}: Props) {
  const s = styles[variant];

  return (
    <Dialog titulo={title} onClose={onCancel} bloqueado={isPending}>
      <div className={s.container}>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-2">{message}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={isPending}
            className={s.button}
          >
            {isPending ? 'Aguarde...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
