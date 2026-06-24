import { useId, type SelectHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
};

export function Select({ className, error, id, label, options, placeholder, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="space-y-2">
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-slate-800 dark:text-slate-100"
      >
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        className={cn(
          'h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10',
          'dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/10',
          error &&
            'border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:border-red-400 dark:focus:border-red-400',
          className,
        )}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
