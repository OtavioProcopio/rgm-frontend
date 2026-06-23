import { useMutation, useQueryClient } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useEnviarParaValidacao(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => solicitacoesApi.enviarParaValidacao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() });
    },
  });
}
