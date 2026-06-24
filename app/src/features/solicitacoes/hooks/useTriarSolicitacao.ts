import { useMutation, useQueryClient } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import type { TriarSolicitacaoRequest } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useTriarSolicitacao(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TriarSolicitacaoRequest) => solicitacoesApi.triar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() });
    },
  });
}
