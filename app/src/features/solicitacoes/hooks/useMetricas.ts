import { useQuery } from '@tanstack/react-query';
import { solicitacoesApi } from '../api/solicitacoesApi';

export function useMetricas() {
  return useQuery({
    queryKey: ['solicitacoes', 'metricas'],
    queryFn: async () => {
      const response = await solicitacoesApi.obterMetricas();
      return response;
    },
  });
}
