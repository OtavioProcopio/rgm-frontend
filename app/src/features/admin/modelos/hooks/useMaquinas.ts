import { useQuery } from '@tanstack/react-query';

import { maquinasApi } from '../api/maquinasApi';
import { maquinasKeys } from './maquinasKeys';

export function useMaquinas() {
  return useQuery({
    queryKey: maquinasKeys.lists(),
    queryFn: () => maquinasApi.listar(),
    staleTime: 1000 * 60 * 5,
  });
}
