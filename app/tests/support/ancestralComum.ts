/**
 * Elemento mais próximo que contém os dois elementos dados: o bloco que os reúne na tela.
 * Serve para achar a moldura de um grupo de campos sem depender da classe dela.
 */
export function ancestralComum(primeiro: HTMLElement, segundo: HTMLElement): HTMLElement {
  let atual: HTMLElement | null = primeiro.parentElement;
  while (atual && !atual.contains(segundo)) {
    atual = atual.parentElement;
  }
  if (!atual) {
    throw new Error(
      `Os elementos <${primeiro.tagName.toLowerCase()}> e <${segundo.tagName.toLowerCase()}> não têm ancestral comum; esperado: os dois dentro do mesmo documento.`,
    );
  }
  return atual;
}
