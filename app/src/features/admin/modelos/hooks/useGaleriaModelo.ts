import { useQuery } from '@tanstack/react-query';

import { galeriaApi } from '../api/galeriaApi';
import { galeriaKeys } from './galeriaKeys';

export function useGaleriaModelo(modeloId?: string) {
  return useQuery({
    queryKey: galeriaKeys.all(modeloId ?? ''),
    queryFn: () => galeriaApi.listar(modeloId as string),
    enabled: !!modeloId,
  });
}
