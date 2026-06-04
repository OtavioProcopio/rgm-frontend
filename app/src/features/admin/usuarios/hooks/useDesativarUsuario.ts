import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usuariosApi } from '../api/usuariosApi';
import { usuariosKeys } from './usuariosKeys';

export function useDesativarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usuariosApi.desativar,
    onSuccess: (usuario) => {
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(usuario.id) });
    },
  });
}
