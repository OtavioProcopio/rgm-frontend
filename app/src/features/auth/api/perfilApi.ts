import { httpClient } from '@/shared/api/httpClient';
import type { Usuario } from '@/features/admin/usuarios/types/usuarioTypes';

import type { SenhaAlteradaResponse } from '../types/authTypes';

export type AlterarSenhaRequest = {
  senhaAtual: string;
  novaSenha: string;
};

export const perfilApi = {
  obterPerfil: () => httpClient.get<Usuario>('/usuarios/me'),

  alterarSenha: (payload: AlterarSenhaRequest) =>
    httpClient.patch<SenhaAlteradaResponse>('/usuarios/me/senha', payload),
};
