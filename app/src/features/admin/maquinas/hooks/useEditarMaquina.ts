import { useMutation, useQueryClient } from '@tanstack/react-query';

import { maquinasApi } from '../api/maquinasApi';
import type { EditarMaquinaRequest } from '../types/maquinaTypes';
import { maquinasKeys } from './maquinasKeys';

export function useEditarMaquina() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditarMaquinaRequest }) =>
      maquinasApi.editar(id, payload),
    onSuccess: (maquina) => {
      void queryClient.invalidateQueries({ queryKey: maquinasKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: maquinasKeys.detail(maquina.id) });
    },
  });
}
