import { useMutation, useQueryClient } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { solicitacoesKeys } from './solicitacoesKeys';
import type { AlterarResponsaveisRequest } from '../types/solicitacaoTypes';

export function useAlterarResponsaveis(solicitacaoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AlterarResponsaveisRequest) =>
      solicitacoesApi.alterarResponsaveis(solicitacaoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.detail(solicitacaoId) });
    },
  });
}
