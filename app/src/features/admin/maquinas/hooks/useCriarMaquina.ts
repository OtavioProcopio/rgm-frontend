import { useMutation, useQueryClient } from '@tanstack/react-query';

import { maquinasApi } from '../api/maquinasApi';
import { maquinasKeys } from './maquinasKeys';

export function useCriarMaquina() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: maquinasApi.criar,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: maquinasKeys.lists() }),
  });
}
