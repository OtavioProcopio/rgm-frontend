import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tiposModeloKeys } from '@/features/admin/modelos/hooks/tiposModeloKeys';

import { tiposModeloAdminApi } from '../api/tiposModeloAdminApi';
import type { EditarTipoModeloRequest } from '../types/tipoModeloAdminTypes';

export function useRenomearTipoModelo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditarTipoModeloRequest }) =>
      tiposModeloAdminApi.renomear(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tiposModeloKeys.lists() });
    },
  });
}
