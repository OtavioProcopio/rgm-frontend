import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tiposModeloKeys } from '@/features/admin/modelos/hooks/tiposModeloKeys';

import { tiposModeloAdminApi } from '../api/tiposModeloAdminApi';

export function useCriarTipoModelo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tiposModeloAdminApi.criar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tiposModeloKeys.lists() });
    },
  });
}
