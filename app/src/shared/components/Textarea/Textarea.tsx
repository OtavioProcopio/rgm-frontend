import { useId, useState, type ChangeEvent, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';
import { caracteresRestantes, mensagemDeRestantes } from '@/shared/lib/limites';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function Textarea({
  className,
  error,
  id,
  label,
  maxLength,
  onChange,
  value,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  // Campo não controlado: o tamanho é acompanhado pela digitação.
  const [tamanhoDigitado, setTamanhoDigitado] = useState(0);
  const tamanho = typeof value === 'string' ? value.length : tamanhoDigitado;
  const restantes = maxLength === undefined ? null : caracteresRestantes(tamanho, maxLength);
  const descricoes = [
    error ? `${textareaId}-erro` : null,
    restantes === null ? null : `${textareaId}-contador`,
  ].filter(Boolean);

  function aoDigitar(evento: ChangeEvent<HTMLTextAreaElement>) {
    setTamanhoDigitado(evento.target.value.length);
    onChange?.(evento);
  }

  return (
    <div className="space-y-2">
      <label htmlFor={textareaId} className="block text-sm font-medium text-fg">
        {label}
      </label>
      <textarea
        id={textareaId}
        aria-invalid={Boolean(error)}
        aria-describedby={descricoes.length > 0 ? descricoes.join(' ') : undefined}
        maxLength={maxLength}
        value={value}
        onChange={aoDigitar}
        className={cn(
          'min-h-[100px] w-full rounded-md border border-line-strong bg-surface px-3 py-2.5 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-accent focus:ring-2 focus:ring-accent/40',
          error && 'border-danger focus:border-danger focus:ring-danger/40',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${textareaId}-erro`} className="text-sm text-danger-fg">
          {error}
        </p>
      ) : null}
      {restantes === null ? null : (
        <p id={`${textareaId}-contador`} className="text-xs text-fg-muted">
          {mensagemDeRestantes(restantes)}
        </p>
      )}
    </div>
  );
}
