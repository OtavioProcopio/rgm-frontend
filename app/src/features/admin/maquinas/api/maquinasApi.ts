import { httpClient } from '@/shared/api/httpClient';
import type { PageResponse } from '@/shared/types/page';

import type {
  CriarMaquinaRequest,
  EditarMaquinaRequest,
  Maquina,
  MaquinasFilters,
} from '../types/maquinaTypes';

export const maquinasApi = {
  listar: (filters: MaquinasFilters) =>
    httpClient.get<PageResponse<Maquina>>('/admin/maquinas', { params: filters }),
  listarPublico: (filters: MaquinasFilters) =>
    httpClient.get<PageResponse<Maquina>>('/maquinas', { params: filters }),
  buscarPorId: (id: string) => httpClient.get<Maquina>(`/admin/maquinas/${id}`),
  criar: (payload: CriarMaquinaRequest) => httpClient.post<Maquina>('/admin/maquinas', payload),
  editar: (id: string, payload: EditarMaquinaRequest) =>
    httpClient.put<Maquina>(`/admin/maquinas/${id}`, payload),
  desativar: (id: string) => httpClient.patch<Maquina>(`/admin/maquinas/${id}/desativar`),
  excluir: (id: string) => httpClient.delete<void>(`/admin/maquinas/${id}`),
};
