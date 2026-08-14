import { useMutation, useQueryClient } from '@tanstack/react-query';

import { galeriaApi } from '../api/galeriaApi';
import { galeriaKeys } from './galeriaKeys';
import { modelosKeys } from './modelosKeys';
import type { EditarFotoGaleriaRequest } from '../types/galeriaTypes';

export function useEditarFotoGaleria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      modeloId,
      fotoId,
      payload,
    }: {
      modeloId: string;
      fotoId: string;
      payload: EditarFotoGaleriaRequest;
    }) => galeriaApi.editar(modeloId, fotoId, payload),
    onSuccess: (_foto, { modeloId }) => {
      void queryClient.invalidateQueries({ queryKey: galeriaKeys.all(modeloId) });
      void queryClient.invalidateQueries({ queryKey: modelosKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: modelosKeys.detail(modeloId) });
    },
  });
}
