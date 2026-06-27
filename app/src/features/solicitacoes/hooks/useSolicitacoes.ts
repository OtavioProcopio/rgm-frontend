import { useQuery } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import type { SolicitacoesFilters } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useSolicitacoes(filters: SolicitacoesFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: solicitacoesKeys.list(filters),
    queryFn: () => solicitacoesApi.listar(filters),
    enabled: options?.enabled,
  });
}
