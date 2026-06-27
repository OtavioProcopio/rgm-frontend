import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usuariosApi } from '../api/usuariosApi';
import { usuariosKeys } from './usuariosKeys';

export function useRedefinirSenhaUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, novaSenha }: { id: string; novaSenha: string }) =>
      usuariosApi.redefinirSenha(id, novaSenha),
    onSuccess: (usuario) => {
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(usuario.id) });
    },
  });
}
