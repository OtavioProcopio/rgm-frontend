import type { Leitura } from './leituraDosIndicadores';

/** Meta fixa de prazo cumprido: o gestor não escolhe nem altera o limite. */
export const META_DE_PRAZO = 90;
export const LIMITE_DE_ATENCAO = 75;

/**
 * Leitura do prazo cumprido: verde com 90% ou mais, atenção de 75% a 89%, vermelho abaixo
 * de 75%. Sem concluídas no período não há base, e o texto diz isso em vez de um número.
 */
export function leituraDoPrazo(percentual: number | null): Leitura {
  if (percentual === null) return { tom: 'neutro', texto: 'Sem concluídas no período' };
  if (percentual >= META_DE_PRAZO)
    return { tom: 'ok', texto: `Dentro da meta de ${META_DE_PRAZO}%` };
  if (percentual >= LIMITE_DE_ATENCAO) {
    return { tom: 'atencao', texto: `Atenção: abaixo da meta de ${META_DE_PRAZO}%` };
  }
  return { tom: 'ruim', texto: `Ruim: abaixo de ${LIMITE_DE_ATENCAO}%` };
}

/** Porcentagem com no máximo 1 casa, em vírgula decimal; `null` vira travessão. */
export function formatarPercentual(valor: number | null): string {
  if (valor === null) return '—';
  return `${Number.isInteger(valor) ? valor : valor.toFixed(1).replace('.', ',')}%`;
}
