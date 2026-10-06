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
  CRIACAO: 'Criação de modelo',
};

export function getSolicitacaoErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado.';
}

/** Frase do aviso quando a ação foi feita e a foto que a acompanha não foi enviada. */
export const acaoFeitaSemFoto = {
  ABRIR: 'A solicitação foi aberta, mas a foto não foi enviada.',
  TRIAR: 'A solicitação foi triada, mas a foto não foi enviada.',
  DEVOLVER: 'A solicitação foi devolvida, mas a foto não foi enviada.',
} as const;

/** Erro do formulário quando a foto vai antes da ação e o envio falha: nada foi feito. */
export function mensagemFotoNaoEnviadaAntes(error: unknown): string {
  const motivo = error instanceof ApiError && error.message ? ` ${error.message}` : '';
  return `A foto não foi enviada e a solicitação não foi concluída.${motivo}`;
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
