import { useQuery } from '@tanstack/react-query';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import { modelosKeys } from '@/features/admin/modelos/hooks/modelosKeys';
import type { ModelosFilters } from '@/features/admin/modelos/types/modeloTypes';

/** Em que posição do filtro um modelo está: dá o bloco em que a lista abre num link direto. */
export function usePosicaoDoModelo(
  id: string,
  consulta: Omit<ModelosFilters, 'page' | 'size' | 'ordem'>,
  habilitado: boolean,
) {
  return useQuery({
    queryKey: modelosKeys.posicao(id, consulta),
    queryFn: () => modelosApi.posicao(id, consulta),
    enabled: habilitado && id !== '',
    retry: false,
    staleTime: 0,
  });
}
