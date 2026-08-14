import { httpClient } from '@/shared/api/httpClient';

import type { Maquina } from '@/features/admin/modelos/types/maquinaTypes';

import type { CriarMaquinaRequest, EditarMaquinaRequest } from '../types/maquinaAdminTypes';

export const maquinasAdminApi = {
  criar: (payload: CriarMaquinaRequest) =>
    httpClient.post<Maquina>('/admin/maquinas', payload),
  renomear: (id: string, payload: EditarMaquinaRequest) =>
    httpClient.put<Maquina>(`/admin/maquinas/${id}`, payload),
  ativar: (id: string) => httpClient.patch<Maquina>(`/admin/maquinas/${id}/ativar`),
  desativar: (id: string) => httpClient.patch<Maquina>(`/admin/maquinas/${id}/desativar`),
};
