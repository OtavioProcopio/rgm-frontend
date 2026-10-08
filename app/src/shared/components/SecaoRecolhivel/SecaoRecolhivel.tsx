import { ChevronDown } from 'lucide-react';
import { useId } from 'react';
import type { ReactNode } from 'react';

import { usePreferenciaGuardada } from '@/shared/hooks/usePreferenciaGuardada';
import { cn } from '@/shared/lib/cn';

type SecaoRecolhivelProps = {
  id: string;
  titulo: string;
  resumo?: string;
  children: ReactNode;
  className?: string;
};

export function SecaoRecolhivel({ id, titulo, resumo, children, className }: SecaoRecolhivelProps) {
  const idConteudo = useId();
  const [estado, definirEstado] = usePreferenciaGuardada(`rgm.secao.${id}`, 'aberta');
  const aberta = estado !== 'fechada';

  return (
    <section className={className}>
      <button
        type="button"
        aria-expanded={aberta}
        aria-controls={idConteudo}
        onClick={() => definirEstado(aberta ? 'fechada' : 'aberta')}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-line bg-surface-muted px-4 py-3 text-left text-sm font-medium text-fg pointer-coarse:min-h-11"
      >
        <span>{aberta ? titulo : (resumo ?? titulo)}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 shrink-0 motion-safe:transition-transform', aberta && 'rotate-180')}
        />
      </button>
      <div id={idConteudo} hidden={!aberta}>
        {children}
      </div>
    </section>
  );
}
