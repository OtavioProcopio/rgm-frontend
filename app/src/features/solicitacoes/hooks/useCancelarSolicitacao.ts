import { useMutation, useQueryClient } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import type { CancelarSolicitacaoRequest } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useCancelarSolicitacao(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CancelarSolicitacaoRequest) => solicitacoesApi.cancelar(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: solicitacoesKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() });
    },
  });
}
