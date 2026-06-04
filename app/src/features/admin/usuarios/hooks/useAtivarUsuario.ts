import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usuariosApi } from '../api/usuariosApi';
import { usuariosKeys } from './usuariosKeys';

export function useAtivarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usuariosApi.ativar,
    onSuccess: (usuario) => {
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(usuario.id) });
    },
  });
}
