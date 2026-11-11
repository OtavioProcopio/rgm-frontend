import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import { modelosKeys } from '@/features/admin/modelos/hooks/modelosKeys';
import type { ModelosFilters } from '@/features/admin/modelos/types/modeloTypes';

/**
 * Quantos modelos cada botão de tipo e de máquina traria. Mantém os números anteriores enquanto
 * os novos chegam, para os botões não piscarem a cada tecla da busca.
 */
export function useContagensDeModelos(consulta: Omit<ModelosFilters, 'page' | 'size' | 'ordem'>) {
  return useQuery({
    queryKey: modelosKeys.contagens(consulta),
    queryFn: () => modelosApi.contagens(consulta),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });
}
