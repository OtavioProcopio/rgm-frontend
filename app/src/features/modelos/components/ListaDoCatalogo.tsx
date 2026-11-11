import type { To } from 'react-router';

import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';
import { Button } from '@/shared/components/Button/Button';

import { ItemDoCatalogo } from './ItemDoCatalogo';

type Props = {
  modelos: Modelo[];
  destaqueId: string;
  linkDoModelo: (id: string) => To;
  total: number;
  restantesDepois: number;
  restantesAntes: number;
  buscandoDepois: boolean;
  buscandoAntes: boolean;
  /** Falhou ao buscar um bloco a mais; os já carregados seguem na lista. */
  erroNoBloco: boolean;
  aoCarregarDepois: () => void;
  aoCarregarAntes: () => void;
};

/** A lista ao lado do destaque, sempre visível, carregada por blocos. */
export function ListaDoCatalogo({
  modelos,
  destaqueId,
  linkDoModelo,
  total,
  restantesDepois,
  restantesAntes,
  buscandoDepois,
  buscandoAntes,
  erroNoBloco,
  aoCarregarDepois,
  aoCarregarAntes,
}: Props) {
  return (
    <aside
      aria-label="Lista de modelos"
      className="space-y-2 rounded-xl border border-line bg-surface p-3"
    >
      <p className="text-sm text-fg-muted">
        {total} {total === 1 ? 'modelo' : 'modelos'} · mostrando {modelos.length}
      </p>
      {erroNoBloco ? (
        <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger-fg">
          Não foi possível carregar mais modelos. Tente novamente.
        </p>
      ) : null}
      <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
        {restantesAntes > 0 ? (
          <Button
            variant="secondary"
            className="w-full"
            disabled={buscandoAntes}
            onClick={aoCarregarAntes}
          >
            {buscandoAntes ? 'Carregando…' : `Carregar anteriores (${restantesAntes})`}
          </Button>
        ) : null}
        <ul className="space-y-2">
          {modelos.map((modelo) => (
            <li key={modelo.id}>
              <ItemDoCatalogo
                modelo={modelo}
                para={linkDoModelo(modelo.id)}
                emDestaque={modelo.id === destaqueId}
              />
            </li>
          ))}
        </ul>
        {restantesDepois > 0 ? (
          <Button
            variant="secondary"
            className="w-full"
            disabled={buscandoDepois}
            onClick={aoCarregarDepois}
          >
            {buscandoDepois ? 'Carregando…' : `Carregar mais (${restantesDepois} restantes)`}
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
