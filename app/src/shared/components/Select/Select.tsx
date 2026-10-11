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
  limpavel?: boolean;
};

export function Select({
  className,
  error,
  id,
  label,
  limpavel = false,
  options,
  placeholder,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="space-y-2">
      <label htmlFor={selectId} className="block text-sm font-medium text-fg">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-erro` : undefined}
        className={cn(
          'h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-fg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/40',
          error && 'border-danger focus:border-danger focus:ring-danger/40',
          className,
        )}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled={!limpavel}>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${selectId}-erro`} className="text-sm text-danger-fg">
          {error}
        </p>
      ) : null}
    </div>
  );
}
