import type { SolicitacoesFilters } from '../types/solicitacaoTypes';

export const solicitacoesKeys = {
  all: ['solicitacoes'] as const,
  lists: () => [...solicitacoesKeys.all, 'list'] as const,
  list: (filters: SolicitacoesFilters) => [...solicitacoesKeys.lists(), filters] as const,
  details: () => [...solicitacoesKeys.all, 'detail'] as const,
  detail: (id: string) => [...solicitacoesKeys.details(), id] as const,
  atividades: (id: string) => [...solicitacoesKeys.detail(id), 'atividades'] as const,
};
