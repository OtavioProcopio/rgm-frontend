import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usuariosApi } from '../api/usuariosApi';
import { usuariosKeys } from './usuariosKeys';

export function useExcluirUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usuariosApi.excluir,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
}
