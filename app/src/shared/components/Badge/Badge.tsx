import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

const VARIACOES = {
  neutral: 'bg-surface-muted text-fg-muted',
  accent: 'bg-accent text-on-accent',
  success: 'bg-success-soft text-success-fg',
  warning: 'bg-warning-soft text-warning-fg',
  danger: 'bg-danger-soft text-danger-fg',
  info: 'bg-info-soft text-info-fg',
};

export type BadgeVariant = keyof typeof VARIACOES;

type BadgeProps = {
  variant?: BadgeVariant;
  /** Ícone decorativo, mostrado antes do texto. */
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Selo: o texto diz o que é; a cor da variação só reforça. */
export function Badge({ variant = 'neutral', icon, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        VARIACOES[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
