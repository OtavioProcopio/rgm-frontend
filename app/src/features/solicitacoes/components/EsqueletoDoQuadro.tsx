import { Skeleton } from '@/shared/components/Skeleton/Skeleton';

import { COLUMNS } from './kanbanColunas';

const CARTOES_POR_COLUNA = 3;

/** O quadro enquanto carrega: as colunas de sempre, com cartões de esqueleto no lugar dos reais. */
export function EsqueletoDoQuadro() {
  return (
    <div role="status" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <span className="sr-only">Carregando quadro...</span>
      {COLUMNS.map((coluna) => (
        <div
          key={coluna.status}
          className="space-y-3 rounded-md border border-line bg-surface-muted p-3"
        >
          <Skeleton className="h-5 w-1/2" />
          {Array.from({ length: CARTOES_POR_COLUNA }, (_, indice) => (
            <Skeleton key={indice} className="h-24 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
