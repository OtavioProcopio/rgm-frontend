import { ApiError } from '@/shared/api/apiError';

import type {
  PrioridadeSolicitacao,
  StatusSolicitacao,
  TipoSolicitacao,
} from '../types/solicitacaoTypes';

export const statusLabel: Record<StatusSolicitacao, string> = {
  A_FAZER: 'A fazer',
  EM_ANDAMENTO: 'Em andamento',
  EM_VALIDACAO: 'Em validação',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

export const prioridadeLabel: Record<PrioridadeSolicitacao, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

export const tipoLabel: Record<TipoSolicitacao, string> = {
  REPARO: 'Reparo',
  INSPECAO: 'Inspeção',
  REENGENHARIA: 'Reengenharia',
};

export function getSolicitacaoErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado.';
}

export function formatDuracao(segundos: number): string {
  const horas = segundos / 3600;
  if (horas < 24) {
    return `${Math.round(horas)}h`;
  }
  const dias = Math.floor(horas / 24);
  const horasRestantes = Math.round(horas % 24);
  return `${dias}d ${horasRestantes}h`;
}
