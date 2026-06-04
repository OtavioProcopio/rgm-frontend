import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ className, variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' &&
          'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-white',
        variant === 'secondary' &&
          'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        variant === 'ghost' &&
          'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
        className,
      )}
      {...props}
    />
  );
}
