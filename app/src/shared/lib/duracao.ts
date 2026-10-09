export const MINUTO_MS = 60_000;
export const HORA_MS = 60 * MINUTO_MS;
export const DIA_MS = 24 * HORA_MS;
/** Abaixo deste limite a duração aparece em horas; a partir dele, em dias. */
export const LIMITE_EM_HORAS_MS = 2 * DIA_MS;

export type UnidadeDeDuracao = 'min' | 'h' | 'd';
export type DuracaoEscalada = { valor: number; unidade: UnidadeDeDuracao };

/** Minutos abaixo de 1 hora, horas abaixo de 48 horas, dias a partir daí (valor truncado). */
export function escalarDuracao(ms: number): DuracaoEscalada {
  if (ms < HORA_MS) return { valor: Math.floor(ms / MINUTO_MS), unidade: 'min' };
  if (ms < LIMITE_EM_HORAS_MS) return { valor: Math.floor(ms / HORA_MS), unidade: 'h' };
  return { valor: Math.floor(ms / DIA_MS), unidade: 'd' };
}

export function formatarDuracao(ms: number): string {
  const { valor, unidade }: DuracaoEscalada = escalarDuracao(ms);
  return `${unidade === 'min' ? Math.max(1, valor) : valor} ${unidade}`;
}
