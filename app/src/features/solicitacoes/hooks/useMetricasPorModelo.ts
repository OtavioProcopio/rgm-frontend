import { useQuery } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import type { MetricasPorModeloFilters } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useMetricasPorModelo(filters: MetricasPorModeloFilters) {
  return useQuery({
    queryKey: solicitacoesKeys.metricasPorModelo(filters),
    queryFn: () => solicitacoesApi.obterMetricasPorModelo(filters),
  });
}
