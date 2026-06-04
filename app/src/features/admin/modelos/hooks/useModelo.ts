import { useQuery } from '@tanstack/react-query';

import { modelosApi } from '../api/modelosApi';
import { modelosKeys } from './modelosKeys';

export function useModelo(id?: string) {
  return useQuery({
    queryKey: id ? modelosKeys.detail(id) : modelosKeys.details(),
    queryFn: () => modelosApi.buscarPorId(id ?? ''),
    enabled: Boolean(id),
  });
}
