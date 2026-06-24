import { useQuery } from '@tanstack/react-query';

import { maquinasApi } from '../api/maquinasApi';
import type { MaquinasFilters } from '../types/maquinaTypes';

const maquinasPublicoKeys = {
  list: (filters: MaquinasFilters) => ['maquinas', 'list', filters] as const,
};

export function useMaquinasPublico(filters: MaquinasFilters) {
  return useQuery({
    queryKey: maquinasPublicoKeys.list(filters),
    queryFn: () => maquinasApi.listarPublico(filters),
  });
}
