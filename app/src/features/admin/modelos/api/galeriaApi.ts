import { httpClient } from '@/shared/api/httpClient';

import type { EditarFotoGaleriaRequest, FotoGaleria } from '../types/galeriaTypes';

export const galeriaApi = {
  listar: (modeloId: string) => httpClient.get<FotoGaleria[]>(`/modelos/${modeloId}/galeria`),
  adicionar: (modeloId: string, file: File, identificacao: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('identificacao', identificacao);
    return httpClient.post<FotoGaleria>(`/modelos/${modeloId}/galeria`, formData);
  },
  editar: (modeloId: string, fotoId: string, payload: EditarFotoGaleriaRequest) =>
    httpClient.patch<FotoGaleria>(`/modelos/${modeloId}/galeria/${fotoId}`, payload),
  remover: (modeloId: string, fotoId: string) =>
    httpClient.delete<void>(`/modelos/${modeloId}/galeria/${fotoId}`),
};
