import { useId, type InputHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  labelClassName?: string;
};

export function Input({ className, error, id, label, labelClassName, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className={cn(
          'block text-sm font-medium text-slate-800 dark:text-slate-100',
          labelClassName,
        )}
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-erro` : undefined}
        className={cn(
          'h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition-colors placeholder:text-gray-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/40',
          'dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/50',
          error &&
            'border-red-500 focus:border-red-500 focus:ring-red-500/40 dark:border-red-400 dark:focus:border-red-400',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-erro`} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
