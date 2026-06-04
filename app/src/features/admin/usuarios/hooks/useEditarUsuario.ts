import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usuariosApi } from '../api/usuariosApi';
import type { EditarUsuarioRequest } from '../types/usuarioTypes';
import { usuariosKeys } from './usuariosKeys';

type EditarUsuarioParams = {
  id: string;
  payload: EditarUsuarioRequest;
};

export function useEditarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: EditarUsuarioParams) => usuariosApi.editar(id, payload),
    onSuccess: (usuario) => {
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(usuario.id) });
    },
  });
}
