import { useMutation, useQueryClient } from '@tanstack/react-query';

import { evidenciasApi, type AnexarEvidenciaOptions } from '../api/evidenciasApi';
import { evidenciasKeys } from './evidenciasKeys';

export function useUploadEvidencia(solicitacaoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, ...options }: { file: File } & AnexarEvidenciaOptions) =>
      evidenciasApi.anexar(solicitacaoId, file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: evidenciasKeys.bySolicitacao(solicitacaoId),
      });
    },
  });
}
