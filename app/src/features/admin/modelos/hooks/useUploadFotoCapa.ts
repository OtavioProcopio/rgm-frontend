import { useMutation, useQueryClient } from '@tanstack/react-query';

import { modelosApi } from '../api/modelosApi';
import { modelosKeys } from './modelosKeys';

export function useUploadFotoCapa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => modelosApi.uploadFotoCapa(id, file),
    onSuccess: (modelo) => {
      void queryClient.invalidateQueries({ queryKey: modelosKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: modelosKeys.detail(modelo.id) });
      void queryClient.invalidateQueries({ queryKey: modelosKeys.eventos(modelo.id) });
    },
  });
}
