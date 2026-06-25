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

export function canManageSolicitacoes(perfil?: PerfilUsuario | null) {
  return perfil === 'ADMINISTRADOR' || perfil === 'GESTOR';
}

export function canViewModelos(perfil?: PerfilUsuario | null) {
  return perfil === 'ADMINISTRADOR' || perfil === 'GESTOR' || perfil === 'OPERADOR';
}

export function getDefaultRoute(perfil?: PerfilUsuario | null): string {
  if (perfil === 'ADMINISTRADOR') return '/app/admin';
  return '/app/solicitacoes';
}
