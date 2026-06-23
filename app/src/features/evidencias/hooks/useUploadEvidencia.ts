import { useMutation, useQueryClient } from '@tanstack/react-query';

import { evidenciasApi } from '../api/evidenciasApi';
import { evidenciasKeys } from './evidenciasKeys';

export function useUploadEvidencia(solicitacaoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => evidenciasApi.anexar(solicitacaoId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: evidenciasKeys.bySolicitacao(solicitacaoId),
      });
    },
  });
}
