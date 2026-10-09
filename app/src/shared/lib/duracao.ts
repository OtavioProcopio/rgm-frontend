const MINUTO_MS = 60_000;
const HORA_MS = 60 * MINUTO_MS;
const DIA_MS = 24 * HORA_MS;

/** Minutos abaixo de 1 hora, horas abaixo de 48 horas, dias a partir daí. */
export function formatarDuracao(ms: number): string {
  if (ms < HORA_MS) return `${Math.max(1, Math.floor(ms / MINUTO_MS))} min`;
  if (ms < 2 * DIA_MS) return `${Math.floor(ms / HORA_MS)} h`;
  return `${Math.floor(ms / DIA_MS)} d`;
}
