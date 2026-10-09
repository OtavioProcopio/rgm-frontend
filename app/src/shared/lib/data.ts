import { DIA_MS, HORA_MS, MINUTO_MS } from './duracao';

const LIMITE_EM_HORAS_MS = 48 * HORA_MS;

function isoParaMs(iso: string): number {
  const ms: number = new Date(iso).getTime();
  if (Number.isNaN(ms)) {
    throw new RangeError(`Data inválida: "${iso}"; esperado ISO 8601, como 2026-10-09T14:30:00Z`);
  }
  return ms;
}

export function tempoRelativo(iso: string, agoraMs: number): string {
  const decorrido: number = agoraMs - isoParaMs(iso);
  if (decorrido < MINUTO_MS) return 'agora';
  if (decorrido < HORA_MS) return `há ${Math.floor(decorrido / MINUTO_MS)} min`;
  if (decorrido < LIMITE_EM_HORAS_MS) return `há ${Math.floor(decorrido / HORA_MS)} h`;
  return `há ${Math.floor(decorrido / DIA_MS)} d`;
}

export function formatarDataHora(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    isoParaMs(iso),
  );
}

function doisDigitos(valor: number): string {
  return String(valor).padStart(2, '0');
}

function chaveDaData(data: Date): string {
  const mes: string = doisDigitos(data.getMonth() + 1);
  return `${data.getFullYear()}-${mes}-${doisDigitos(data.getDate())}`;
}

export function chaveDoDia(iso: string): string {
  return chaveDaData(new Date(isoParaMs(iso)));
}

export function rotuloDoDia(iso: string, agoraMs: number): string {
  const chave: string = chaveDoDia(iso);
  const hoje: Date = new Date(agoraMs);
  if (chave === chaveDaData(hoje)) return 'Hoje';
  const ontem: Date = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1);
  if (chave === chaveDaData(ontem)) return 'Ontem';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(isoParaMs(iso));
}
