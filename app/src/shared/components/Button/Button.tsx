import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** `md` tem a altura mínima de toque (44 px); `sm` é para tabelas densas no computador. */
  size?: 'md' | 'sm';
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        size === 'md' ? 'min-h-11 py-2' : 'min-h-9 py-1.5',
        variant === 'primary' && 'bg-accent text-on-accent hover:bg-accent-hover',
        variant === 'secondary' && 'bg-surface-muted text-fg hover:brightness-95',
        variant === 'ghost' && 'bg-transparent text-fg-muted hover:bg-surface-muted',
        variant === 'danger' && 'bg-danger text-on-solid hover:bg-danger-hover',
        className,
      )}
      {...props}
    />
  );
}
