import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usuariosApi } from '../api/usuariosApi';
import { usuariosKeys } from './usuariosKeys';

export function useCriarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usuariosApi.criar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
}
