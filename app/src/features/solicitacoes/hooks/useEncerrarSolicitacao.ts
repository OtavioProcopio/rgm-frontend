import { useMutation, useQueryClient } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import type { EncerrarSolicitacaoRequest } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useEncerrarSolicitacao(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EncerrarSolicitacaoRequest) => solicitacoesApi.encerrar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() });
    },
  });
}
