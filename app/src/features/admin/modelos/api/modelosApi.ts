import { httpClient } from '@/shared/api/httpClient';
import type { PageResponse } from '@/shared/types/page';

import type {
  CriarModeloRequest,
  EditarModeloRequest,
  EventoModelo,
  FotoCapaUploadRequest,
  Modelo,
  ModelosFilters,
} from '../types/modeloTypes';

export const modelosApi = {
  listar: (filters: ModelosFilters) =>
    httpClient.get<PageResponse<Modelo>>('/modelos', { params: filters }),
  buscarPorId: (id: string) => httpClient.get<Modelo>(`/modelos/${id}`),
  listarEventos: (id: string) => httpClient.get<EventoModelo[]>(`/modelos/${id}/eventos`),
  criar: (payload: CriarModeloRequest) => httpClient.post<Modelo>('/modelos', payload),
  editar: (id: string, payload: EditarModeloRequest) =>
    httpClient.put<Modelo>(`/modelos/${id}`, payload),
  desativar: (id: string) => httpClient.patch<Modelo>(`/modelos/${id}/desativar`),
  uploadFotoCapa: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return httpClient.post<Modelo>(`/modelos/${id}/foto-capa`, formData);
  },
  usarEvidenciaComoFotoCapa: (id: string, evidenciaId: string) =>
    httpClient.patch<Modelo>(`/modelos/${id}/foto-capa`, {
      evidenciaId,
    } satisfies FotoCapaUploadRequest),
  excluir: (id: string) =>
    httpClient.delete<void>('/admin/registros', {
      tipoRecurso: 'MODELO',
      recursoId: id,
    }),
};
