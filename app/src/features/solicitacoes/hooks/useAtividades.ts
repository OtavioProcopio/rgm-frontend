import { useQuery } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useAtividades(solicitacaoId: string) {
  return useQuery({
    queryKey: solicitacoesKeys.atividades(solicitacaoId),
    queryFn: () => solicitacoesApi.listarAtividades(solicitacaoId),
    enabled: Boolean(solicitacaoId),
  });
}
