import { useId, type ReactNode } from 'react';

import { Card } from '@/shared/components/Card/Card';

type Props = { titulo: string; descricao?: string; children: ReactNode };

/** Moldura de um bloco de gestão: título, uma linha de contexto e o conteúdo. */
export function Bloco({ titulo, descricao, children }: Props) {
  const tituloId = useId();
  return (
    <Card as="section" aria-labelledby={tituloId} className="space-y-3 p-5">
      <header>
        <h2 id={tituloId} className="text-base font-semibold text-fg">
          {titulo}
        </h2>
        {descricao ? <p className="text-xs text-fg-muted">{descricao}</p> : null}
      </header>
      {children}
    </Card>
  );
}
