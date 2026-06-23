import { useMutation, useQueryClient } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import type { ComentarioRequest } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useRegistrarComentario(solicitacaoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ComentarioRequest) => solicitacoesApi.comentar(solicitacaoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.atividades(solicitacaoId) });
    },
  });
}
