import { useQuery } from '@tanstack/react-query';

import { modelosApi } from '../api/modelosApi';
import type { ModelosFilters } from '../types/modeloTypes';
import { modelosKeys } from './modelosKeys';

export function useModelos(filters: ModelosFilters) {
  return useQuery({
    queryKey: modelosKeys.list(filters),
    queryFn: () => modelosApi.listar(filters),
  });
}
