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
      <label
        htmlFor={textareaId}
        className="block text-sm font-medium text-slate-800 dark:text-slate-100"
      >
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
          'min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-950 outline-none transition-colors placeholder:text-gray-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/40',
          'dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/50',
          error &&
            'border-red-500 focus:border-red-500 focus:ring-red-500/40 dark:border-red-400 dark:focus:border-red-400',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${textareaId}-erro`} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
      {restantes === null ? null : (
        <p id={`${textareaId}-contador`} className="text-xs text-slate-600 dark:text-slate-400">
          {mensagemDeRestantes(restantes)}
        </p>
      )}
    </div>
  );
}
