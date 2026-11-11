export type PosicaoNoCatalogo<T extends { id: string }> = {
  /** Posição (a partir de 1) no filtro inteiro, não só nos blocos carregados. */
  numero: number;
  anterior: T | null;
  proximo: T | null;
  /** Está no primeiro modelo carregado e há blocos antes dele. */
  faltaCarregarAntes: boolean;
  /** Está no último modelo carregado e há blocos depois dele. */
  faltaCarregarDepois: boolean;
};

/**
 * Onde o modelo está entre os blocos carregados. `primeiraPagina` é o bloco (a partir de 0) em que
 * a lista começou, `tamanho` o tamanho do bloco e `total` o do filtro inteiro, dado pelo servidor.
 * Nulo quando o modelo não está carregado.
 */
export function posicaoNoCatalogo<T extends { id: string }>(
  modelos: readonly T[],
  idAtual: string,
  primeiraPagina: number,
  tamanho: number,
  total: number,
): PosicaoNoCatalogo<T> | null {
  const indice = modelos.findIndex((modelo) => modelo.id === idAtual);
  if (indice === -1) return null;
  const numero = primeiraPagina * tamanho + indice + 1;
  const anterior = modelos[indice - 1] ?? null;
  const proximo = modelos[indice + 1] ?? null;
  return {
    numero,
    anterior,
    proximo,
    faltaCarregarAntes: anterior === null && numero > 1,
    faltaCarregarDepois: proximo === null && numero < total,
  };
}
