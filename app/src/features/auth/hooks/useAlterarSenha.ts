import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/app/providers/authContext';

import { perfilApi } from '../api/perfilApi';
import { credenciaisDaTroca } from '../lib/credenciaisDaTroca';

export function useAlterarSenha() {
  const { renovarCredenciais } = useAuth();

  return useMutation({
    mutationFn: perfilApi.alterarSenha,
    onSuccess: (resposta) => {
      // A troca invalida as credenciais antigas; a sessão segue com as que a API devolveu.
      const credenciais = credenciaisDaTroca(resposta);
      if (credenciais) renovarCredenciais(credenciais.token, credenciais.refreshToken);
    },
  });
}
