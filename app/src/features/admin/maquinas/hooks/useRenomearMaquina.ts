import { useMutation, useQueryClient } from '@tanstack/react-query';

import { maquinasKeys } from '@/features/admin/modelos/hooks/maquinasKeys';

import { maquinasAdminApi } from '../api/maquinasAdminApi';
import type { EditarMaquinaRequest } from '../types/maquinaAdminTypes';

export function useRenomearMaquina() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditarMaquinaRequest }) =>
      maquinasAdminApi.renomear(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: maquinasKeys.lists() });
    },
  });
}
