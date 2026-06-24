import { useQuery } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useSolicitacao(id: string) {
  return useQuery({
    queryKey: solicitacoesKeys.detail(id),
    queryFn: () => solicitacoesApi.buscarPorId(id),
    enabled: Boolean(id),
  });
}
