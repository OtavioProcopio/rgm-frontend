import { useQuery } from '@tanstack/react-query';

import { maquinasApi } from '../api/maquinasApi';
import { maquinasKeys } from './maquinasKeys';

export function useMaquina(id?: string) {
  return useQuery({
    queryKey: id ? maquinasKeys.detail(id) : maquinasKeys.details(),
    queryFn: () => maquinasApi.buscarPorId(id ?? ''),
    enabled: Boolean(id),
  });
}
