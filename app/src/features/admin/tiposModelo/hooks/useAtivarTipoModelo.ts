import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tiposModeloKeys } from '@/features/admin/modelos/hooks/tiposModeloKeys';

import { tiposModeloAdminApi } from '../api/tiposModeloAdminApi';

export function useAtivarTipoModelo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tiposModeloAdminApi.ativar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tiposModeloKeys.lists() });
    },
  });
}
