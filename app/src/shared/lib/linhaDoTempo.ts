import { chaveDoDia, rotuloDoDia } from '@/shared/lib/data';

export const LIMITE_VISIVEL = 10;

export type GrupoDoDia<T> = { chave: string; rotulo: string; itens: T[] };

function ordenarRecentesPrimeiro<T extends { em: string }>(itens: readonly T[]): T[] {
  return [...itens].sort(
    (a: T, b: T): number => new Date(b.em).getTime() - new Date(a.em).getTime(),
  );
}

export function agruparPorDia<T extends { em: string }>(
  itens: readonly T[],
  agoraMs: number,
): GrupoDoDia<T>[] {
  const grupos: Map<string, GrupoDoDia<T>> = new Map();
  for (const item of ordenarRecentesPrimeiro(itens)) {
    const chave: string = chaveDoDia(item.em);
    const grupo: GrupoDoDia<T> | undefined = grupos.get(chave);
    if (grupo) grupo.itens.push(item);
    else grupos.set(chave, { chave, rotulo: rotuloDoDia(item.em, agoraMs), itens: [item] });
  }
  return [...grupos.values()];
}

export function recolherGrupos<T>(
  grupos: GrupoDoDia<T>[],
  expandido: boolean,
  limite: number = LIMITE_VISIVEL,
): { grupos: GrupoDoDia<T>[]; ocultos: number } {
  const total: number = grupos.reduce((soma: number, g: GrupoDoDia<T>) => soma + g.itens.length, 0);
  if (expandido || total <= limite) return { grupos, ocultos: 0 };
  const visiveis: GrupoDoDia<T>[] = [];
  let restante: number = limite;
  for (const g of grupos) {
    if (restante <= 0) break;
    visiveis.push({ ...g, itens: g.itens.slice(0, restante) });
    restante -= g.itens.length;
  }
  return { grupos: visiveis, ocultos: total - limite };
}
