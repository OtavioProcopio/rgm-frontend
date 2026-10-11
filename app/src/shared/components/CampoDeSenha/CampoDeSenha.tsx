import { useState, type ComponentProps } from 'react';

import { Input } from '@/shared/components/Input/Input';
import { cn } from '@/shared/lib/cn';

type CampoDeSenhaProps = Omit<ComponentProps<typeof Input>, 'type'>;

/**
 * Campo de senha com o botão de mostrar e ocultar o texto digitado. O botão fica sobre o campo:
 * `top-8` é o rótulo (20 px) mais o espaço (8 px) mais a folga do botão de 36 px no campo de 44 px.
 */
export function CampoDeSenha({ className, ...props }: CampoDeSenhaProps) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={visivel ? 'text' : 'password'} className={cn('pr-28', className)} />
      <button
        type="button"
        aria-pressed={visivel}
        disabled={props.disabled}
        onClick={() => setVisivel((atual) => !atual)}
        className="absolute right-1 top-8 flex h-9 items-center rounded-md px-3 text-xs font-medium text-fg-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {visivel ? 'Ocultar senha' : 'Mostrar senha'}
      </button>
    </div>
  );
}
