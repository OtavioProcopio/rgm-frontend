import { useMutation, useQueryClient } from '@tanstack/react-query';

import { modelosApi } from '../api/modelosApi';
import { modelosKeys } from './modelosKeys';

export function useCriarModelo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modelosApi.criar,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: modelosKeys.lists() }),
  });
}
