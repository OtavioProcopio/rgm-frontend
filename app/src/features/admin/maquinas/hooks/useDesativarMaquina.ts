import { useMutation, useQueryClient } from '@tanstack/react-query';

import { maquinasApi } from '../api/maquinasApi';
import { maquinasKeys } from './maquinasKeys';

export function useDesativarMaquina() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: maquinasApi.desativar,
    onSuccess: (maquina) => {
      void queryClient.invalidateQueries({ queryKey: maquinasKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: maquinasKeys.detail(maquina.id) });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'modelos'] });
    },
  });
}
