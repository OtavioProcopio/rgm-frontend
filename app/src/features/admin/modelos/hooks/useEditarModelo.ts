import { useMutation, useQueryClient } from '@tanstack/react-query';

import { modelosApi } from '../api/modelosApi';
import type { EditarModeloRequest } from '../types/modeloTypes';
import { modelosKeys } from './modelosKeys';

export function useEditarModelo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditarModeloRequest }) =>
      modelosApi.editar(id, payload),
    onSuccess: (modelo) => {
      void queryClient.invalidateQueries({ queryKey: modelosKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: modelosKeys.detail(modelo.id) });
    },
  });
}
