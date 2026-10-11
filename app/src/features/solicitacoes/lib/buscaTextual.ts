export const BUSCA_MINIMA = 2;
export const BUSCA_MAXIMA = 100;

/**
 * Termo que vai à API: aparado, de 2 a 100 caracteres. Termo curto demais ou em branco não vira
 * consulta (a API responderia 400); o que passa de 100 é cortado.
 */
export function termoDeBusca(texto: string | undefined | null): string | undefined {
  const termo = (texto ?? '').trim().slice(0, BUSCA_MAXIMA);
  return termo.length >= BUSCA_MINIMA ? termo : undefined;
}

/** Diz se o usuário digitou algo, mas ainda é curto para buscar. */
export function buscaCurtaDemais(texto: string): boolean {
  const tamanho = texto.trim().length;
  return tamanho > 0 && tamanho < BUSCA_MINIMA;
}
