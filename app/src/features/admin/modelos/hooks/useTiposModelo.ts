import { useQuery } from '@tanstack/react-query';

import { tiposModeloApi } from '../api/tiposModeloApi';
import { tiposModeloKeys } from './tiposModeloKeys';

export function useTiposModelo() {
  return useQuery({
    queryKey: tiposModeloKeys.lists(),
    queryFn: () => tiposModeloApi.listar(),
    staleTime: 1000 * 60 * 5,
  });
}
