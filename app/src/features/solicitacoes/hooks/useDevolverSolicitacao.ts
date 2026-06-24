import { useMutation, useQueryClient } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import type { DevolverSolicitacaoRequest } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useDevolverSolicitacao(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DevolverSolicitacaoRequest) => solicitacoesApi.devolver(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() });
    },
  });
}
