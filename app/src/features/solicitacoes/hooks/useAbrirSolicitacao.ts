import { useMutation, useQueryClient } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useAbrirSolicitacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: solicitacoesApi.abrir,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() });
    },
  });
}
