import { useMutation, useQueryClient } from '@tanstack/react-query';

import { maquinasApi } from '../api/maquinasApi';
import { maquinasKeys } from './maquinasKeys';

export function useExcluirMaquina() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: maquinasApi.excluir,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: maquinasKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'modelos'] });
    },
  });
}
