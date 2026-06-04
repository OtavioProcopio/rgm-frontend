import { useMutation, useQueryClient } from '@tanstack/react-query';

import { modelosApi } from '../api/modelosApi';
import { modelosKeys } from './modelosKeys';

export function useDesativarModelo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modelosApi.desativar,
    onSuccess: (modelo) => {
      void queryClient.invalidateQueries({ queryKey: modelosKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: modelosKeys.detail(modelo.id) });
    },
  });
}
