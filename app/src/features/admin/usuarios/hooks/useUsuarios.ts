import { useQuery } from '@tanstack/react-query';

import { usuariosApi } from '../api/usuariosApi';
import type { UsuariosFilters } from '../types/usuarioTypes';
import { usuariosKeys } from './usuariosKeys';

export function useUsuarios(filters: UsuariosFilters) {
  return useQuery({
    queryKey: usuariosKeys.list(filters),
    queryFn: () => usuariosApi.listar(filters),
  });
}
