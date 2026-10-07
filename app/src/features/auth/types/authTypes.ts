import type { Usuario } from '@/features/admin/usuarios/types/usuarioTypes';

export type PerfilUsuario ='OPERADOR' | 'GESTOR' | 'ADMINISTRADOR' | 'EXTERNO';

export type LoginRequest = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  token: string;
  refreshToken: string;
  nome: string;
  perfil: PerfilUsuario;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RefreshTokenResponse = {
  token: string;
  refreshToken: string;
};

/** Par de credenciais que mantém uma sessão: a de acesso e a de renovação. */
export type Credenciais = {
  token: string;
  refreshToken: string;
};

/**
 * Resposta da troca da própria senha: os dados do usuário e, a partir do backend que invalida
 * as sessões na troca, as credenciais novas da sessão que trocou.
 */
export type SenhaAlteradaResponse = Usuario & {
  token?: string | null;
  refreshToken?: string | null;
};

export type AuthUser = {
  nome: string;
  perfil: PerfilUsuario;
};
