export type PerfilUsuario = 'OPERADOR' | 'GESTOR' | 'ADMINISTRADOR' | 'EXTERNO';

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

export type AuthUser = {
  nome: string;
  perfil: PerfilUsuario;
};
