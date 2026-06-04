import type { PerfilUsuario } from '@/features/auth/types/authTypes';

export function canAccessAdmin(perfil?: PerfilUsuario | null) {
  return perfil === 'ADMINISTRADOR';
}

export function canManageModelos(perfil?: PerfilUsuario | null) {
  return perfil === 'ADMINISTRADOR' || perfil === 'GESTOR';
}

export function canOperateSolicitacoes(perfil?: PerfilUsuario | null) {
  return perfil === 'ADMINISTRADOR' || perfil === 'GESTOR' || perfil === 'OPERADOR';
}
