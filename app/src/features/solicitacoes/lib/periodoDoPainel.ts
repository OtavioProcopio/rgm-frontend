import { DIA_MS } from '@/shared/lib/duracao';

export const PERIODOS = [7, 30, 90] as const;
export type PeriodoDoPainel = (typeof PERIODOS)[number];

/** ISO 8601 UTC; `fim` é exclusivo. */
export type Intervalo = { inicio: string; fim: string };

const iso = (ms: number): string => new Date(ms).toISOString();

/**
 * Janela atual (inclui hoje) e a imediatamente anterior, de mesmo tamanho.
 * Truncada ao dia UTC para o valor ser estável como chave de consulta.
 */
export function intervalosDoPeriodo(
  dias: number,
  agora: Date,
): { atual: Intervalo; anterior: Intervalo } {
  const hoje0: number = Math.floor(agora.getTime() / DIA_MS) * DIA_MS;
  const inicioAtual: number = hoje0 - (dias - 1) * DIA_MS;
  const fimAtual: number = hoje0 + DIA_MS;
  const inicioAnterior: number = inicioAtual - dias * DIA_MS;
  return {
    atual: { inicio: iso(inicioAtual), fim: iso(fimAtual) },
    anterior: { inicio: iso(inicioAnterior), fim: iso(inicioAtual) },
  };
}
