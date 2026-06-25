import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usuariosApi } from '../api/usuariosApi';
import { usuariosKeys } from './usuariosKeys';

export function useAlterarPerfilUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, perfil }: { id: string; perfil: string }) =>
      usuariosApi.alterarPerfil(id, perfil),
    onSuccess: (usuario) => {
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(usuario.id) });
    },
  });
}
