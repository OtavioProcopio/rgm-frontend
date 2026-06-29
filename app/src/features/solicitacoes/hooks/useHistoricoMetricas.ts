import { useQuery } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';

export function useHistoricoMetricas(dias: number, modeloId?: string) {
  return useQuery({
    queryKey: ['solicitacoes', 'metricas', 'historico', dias, modeloId ?? null],
    queryFn: () => solicitacoesApi.obterHistoricoMetricas(dias, modeloId),
  });
}
