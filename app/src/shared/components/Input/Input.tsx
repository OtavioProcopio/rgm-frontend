import { useId, useState, type ChangeEvent, type InputHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';
import { caracteresRestantes, mensagemDeRestantes } from '@/shared/lib/limites';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  labelClassName?: string;
};

export function Input({
  className,
  error,
  id,
  label,
  labelClassName,
  maxLength,
  onChange,
  value,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  // Campo não controlado: o tamanho é acompanhado pela digitação.
  const [tamanhoDigitado, setTamanhoDigitado] = useState(0);
  const tamanho = typeof value === 'string' ? value.length : tamanhoDigitado;
  const restantes = maxLength === undefined ? null : caracteresRestantes(tamanho, maxLength);
  const descricoes = [
    error ? `${inputId}-erro` : null,
    restantes === null ? null : `${inputId}-contador`,
  ].filter(Boolean);

  function aoDigitar(evento: ChangeEvent<HTMLInputElement>) {
    setTamanhoDigitado(evento.target.value.length);
    onChange?.(evento);
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className={cn('block text-sm font-medium text-fg', labelClassName)}>
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={descricoes.length > 0 ? descricoes.join(' ') : undefined}
        maxLength={maxLength}
        value={value}
        onChange={aoDigitar}
        className={cn(
          'h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-accent focus:ring-2 focus:ring-accent/40',
          error && 'border-danger focus:border-danger focus:ring-danger/40',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-erro`} className="text-sm text-danger-fg">
          {error}
        </p>
      ) : null}
      {restantes === null ? null : (
        <p id={`${inputId}-contador`} className="text-xs text-fg-muted">
          {mensagemDeRestantes(restantes)}
        </p>
      )}
    </div>
  );
}
