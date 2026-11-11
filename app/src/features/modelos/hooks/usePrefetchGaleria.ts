import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { galeriaApi } from '@/features/admin/modelos/api/galeriaApi';
import { galeriaKeys } from '@/features/admin/modelos/hooks/galeriaKeys';

/** Carrega em segundo plano as fotos dos modelos vizinhos, para a troca de modelo ser imediata. */
export function usePrefetchGaleria(ids: readonly (string | undefined)[]) {
  const queryClient = useQueryClient();
  const chave = ids.join('|');

  useEffect(() => {
    for (const id of chave.split('|')) {
      if (!id) continue;
      void queryClient.prefetchQuery({
        queryKey: galeriaKeys.all(id),
        queryFn: () => galeriaApi.listar(id),
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [chave, queryClient]);
}
