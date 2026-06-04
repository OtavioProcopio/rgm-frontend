import { useQuery } from '@tanstack/react-query';

import { maquinasApi } from '../api/maquinasApi';
import type { MaquinasFilters } from '../types/maquinaTypes';
import { maquinasKeys } from './maquinasKeys';

export function useMaquinas(filters: MaquinasFilters) {
  return useQuery({
    queryKey: maquinasKeys.list(filters),
    queryFn: () => maquinasApi.listar(filters),
  });
}
