import { useQuery } from '@tanstack/react-query';

import { modelosApi } from '../api/modelosApi';
import { modelosKeys } from './modelosKeys';

export function useEventosModelo(id?: string) {
  return useQuery({
    queryKey: id ? modelosKeys.eventos(id) : modelosKeys.details(),
    queryFn: () => modelosApi.listarEventos(id ?? ''),
    enabled: Boolean(id),
  });
}
