import { useMutation, useQueryClient } from '@tanstack/react-query';

import { maquinasKeys } from '@/features/admin/modelos/hooks/maquinasKeys';

import { maquinasAdminApi } from '../api/maquinasAdminApi';

export function useDesativarMaquina() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: maquinasAdminApi.desativar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: maquinasKeys.lists() });
    },
  });
}
