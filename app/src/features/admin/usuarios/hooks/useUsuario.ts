import { useQuery } from '@tanstack/react-query';

import { usuariosApi } from '../api/usuariosApi';
import { usuariosKeys } from './usuariosKeys';

export function useUsuario(id?: string) {
  return useQuery({
    queryKey: id ? usuariosKeys.detail(id) : usuariosKeys.details(),
    queryFn: () => usuariosApi.buscarPorId(id ?? ''),
    enabled: Boolean(id),
  });
}
