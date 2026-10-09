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

export function recolher<T>(
  itens: readonly T[],
  expandido: boolean,
  limite: number = LIMITE_VISIVEL,
): { visiveis: T[]; ocultos: number } {
  if (expandido || itens.length <= limite) return { visiveis: [...itens], ocultos: 0 };
  return { visiveis: itens.slice(0, limite), ocultos: itens.length - limite };
}
