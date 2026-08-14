import { useMutation, useQueryClient } from '@tanstack/react-query';

import { galeriaApi } from '../api/galeriaApi';
import { galeriaKeys } from './galeriaKeys';
import { modelosKeys } from './modelosKeys';

export function useAdicionarFotoGaleria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      modeloId,
      file,
      identificacao,
    }: {
      modeloId: string;
      file: File;
      identificacao: string;
    }) => galeriaApi.adicionar(modeloId, file, identificacao),
    onSuccess: (_foto, { modeloId }) => {
      void queryClient.invalidateQueries({ queryKey: galeriaKeys.all(modeloId) });
      void queryClient.invalidateQueries({ queryKey: modelosKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: modelosKeys.detail(modeloId) });
    },
  });
}
