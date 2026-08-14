import { useMutation, useQueryClient } from '@tanstack/react-query';

import { galeriaApi } from '../api/galeriaApi';
import { galeriaKeys } from './galeriaKeys';
import { modelosKeys } from './modelosKeys';

export function useRemoverFotoGaleria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ modeloId, fotoId }: { modeloId: string; fotoId: string }) =>
      galeriaApi.remover(modeloId, fotoId),
    onSuccess: (_void, { modeloId }) => {
      void queryClient.invalidateQueries({ queryKey: galeriaKeys.all(modeloId) });
      void queryClient.invalidateQueries({ queryKey: modelosKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: modelosKeys.detail(modeloId) });
    },
  });
}
