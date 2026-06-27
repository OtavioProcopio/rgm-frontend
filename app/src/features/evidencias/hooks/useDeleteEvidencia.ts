import { useMutation, useQueryClient } from '@tanstack/react-query';

import { evidenciasApi } from '../api/evidenciasApi';
import { evidenciasKeys } from './evidenciasKeys';

export function useDeleteEvidencia(solicitacaoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (evidenciaId: string) => evidenciasApi.excluir(solicitacaoId, evidenciaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evidenciasKeys.bySolicitacao(solicitacaoId) });
    },
  });
}
