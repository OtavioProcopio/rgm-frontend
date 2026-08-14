import { httpClient } from '@/shared/api/httpClient';
import type { PageResponse } from '@/shared/types/page';

import type {
  CriarModeloRequest,
  EditarModeloRequest,
  EventoModelo,
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
  ativar: (id: string) => httpClient.patch<Modelo>(`/modelos/${id}/ativar`),
  excluir: (id: string) =>
    httpClient.delete<void>('/admin/registros', {
      tipoRecurso: 'MODELO',
      recursoId: id,
    }),
  exportarLista: (filters: Omit<ModelosFilters, 'page' | 'size'>) =>
    httpClient.get<Blob>('/modelos/relatorio', { params: filters }),
  exportarFicha: (id: string) => httpClient.get<Blob>(`/modelos/${id}/relatorio`),
};
