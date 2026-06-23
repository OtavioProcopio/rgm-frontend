import { useMutation, useQueryClient } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import type { EditarSolicitacaoRequest } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useEditarSolicitacao(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EditarSolicitacaoRequest) => solicitacoesApi.editar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() });
    },
  });
}
