const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function canais(cor: string): [number, number, number] {
  if (!HEX.test(cor)) throw new Error(`Cor inválida: "${cor}"`);
  const digitos = cor.slice(1);
  const completa = digitos.length === 3 ? [...digitos].map((d) => d + d).join('') : digitos;
  return [0, 2, 4].map((i) => parseInt(completa.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}

function linear(canal: number): number {
  return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
}

/** Luminância relativa de uma cor em hexadecimal, de 0 (preto) a 1 (branco). */
export function luminancia(cor: string): number {
  const [r, g, b] = canais(cor).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Razão de contraste entre duas cores, de 1 a 21, como definida nas diretrizes de
 * acessibilidade para conteúdo web. A ordem das cores não importa.
 */
export function contraste(corA: string, corB: string): number {
  const [clara, escura] = [luminancia(corA), luminancia(corB)].sort((a, b) => b - a);
  return (clara + 0.05) / (escura + 0.05);
}
