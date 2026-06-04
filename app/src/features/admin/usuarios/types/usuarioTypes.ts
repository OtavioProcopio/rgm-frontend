import type { PerfilUsuario } from '@/features/auth/types/authTypes';

export type { PerfilUsuario };

export type Usuario = {
  id: string;
  nome: string;
  email: string | null;
  perfil: PerfilUsuario;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export type UsuariosFilters = {
  page: number;
  size: number;
  perfil?: PerfilUsuario;
  ativo?: boolean;
};

export type CriarUsuarioRequest = {
  nome: string;
  email?: string;
  senha?: string;
  perfil: PerfilUsuario;
  ativo: boolean;
};

export type EditarUsuarioRequest = {
  nome: string;
  email: string;
};
