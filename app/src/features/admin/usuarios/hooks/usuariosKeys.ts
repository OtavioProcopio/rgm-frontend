import type { UsuariosFilters } from '../types/usuarioTypes';

export const usuariosKeys = {
  all: ['admin', 'usuarios'] as const,
  lists: () => [...usuariosKeys.all, 'list'] as const,
  list: (filters: UsuariosFilters) => [...usuariosKeys.lists(), filters] as const,
  details: () => [...usuariosKeys.all, 'detail'] as const,
  detail: (id: string) => [...usuariosKeys.details(), id] as const,
};
