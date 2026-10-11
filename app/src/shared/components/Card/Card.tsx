import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

type CardProps = HTMLAttributes<HTMLElement> & {
  /** Etiqueta do elemento, conforme o que o cartão é na página. */
  as?: 'div' | 'section' | 'article' | 'li';
};

/** Moldura de cartão: superfície, borda e canto. O espaço interno é de quem usa. */
export function Card({ as: Etiqueta = 'div', className, ...resto }: CardProps) {
  return (
    <Etiqueta
      className={cn('rounded-xl border border-line bg-surface shadow-sm', className)}
      {...resto}
    />
  );
}
