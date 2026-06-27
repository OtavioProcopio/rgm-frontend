import { httpClient } from '@/shared/api/httpClient';
import type { Usuario } from '@/features/admin/usuarios/types/usuarioTypes';

export type AlterarSenhaRequest = {
  senhaAtual: string;
  novaSenha: string;
};

export const perfilApi = {
  obterPerfil: () => httpClient.get<Usuario>('/usuarios/me'),

  alterarSenha: (payload: AlterarSenhaRequest) =>
    httpClient.patch<Usuario>('/usuarios/me/senha', payload),
};
