import type { Usuario } from '../types/usuarioTypes';

/** Só operadores e gestores ativos podem ser responsáveis por uma solicitação. */
export function filtrarResponsaveisDisponiveis(usuarios: readonly Usuario[]): Usuario[] {
  return usuarios.filter((u) => u.ativo && (u.perfil === 'OPERADOR' || u.perfil === 'GESTOR'));
}
