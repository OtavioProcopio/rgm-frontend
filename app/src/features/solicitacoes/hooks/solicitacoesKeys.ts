import type { MetricasPorModeloFilters, SolicitacoesFilters } from '../types/solicitacaoTypes';

export const solicitacoesKeys = {
  all: ['solicitacoes'] as const,
  lists: () => [...solicitacoesKeys.all, 'list'] as const,
  list: (filters: SolicitacoesFilters) => [...solicitacoesKeys.lists(), filters] as const,
  details: () => [...solicitacoesKeys.all, 'detail'] as const,
  detail: (id: string) => [...solicitacoesKeys.details(), id] as const,
  atividades: (id: string) => [...solicitacoesKeys.detail(id), 'atividades'] as const,
  /** Marca local, sem consulta: conta os eventos de mudança recebidos para a solicitação. */
  atualizacao: (id: string) => [...solicitacoesKeys.all, 'atualizacao', id] as const,
  /** Estado local, sem consulta: se a conexão de tempo real está aberta e desde quando. */
  conexao: () => [...solicitacoesKeys.all, 'conexao'] as const,
  metricasPorModelo: (filters: MetricasPorModeloFilters) =>
    [...solicitacoesKeys.all, 'metricas-por-modelo', filters] as const,
};
