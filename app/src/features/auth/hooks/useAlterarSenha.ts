import { useMutation } from '@tanstack/react-query';
import { perfilApi } from '../api/perfilApi';

export function useAlterarSenha() {
  return useMutation({
    mutationFn: perfilApi.alterarSenha,
  });
}
