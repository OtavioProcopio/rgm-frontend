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
        variant === 'primary' &&
          'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400',
        variant === 'secondary' &&
          'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
        variant === 'ghost' &&
          'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
        variant === 'danger' &&
          'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500',
        className,
      )}
      {...props}
    />
  );
}
