import { httpClient } from '@/shared/api/httpClient';

import type { TipoDeModelo } from '@/features/admin/modelos/types/tipoModeloTypes';

import type {
  CriarTipoModeloRequest,
  EditarTipoModeloRequest,
} from '../types/tipoModeloAdminTypes';

export const tiposModeloAdminApi = {
  criar: (payload: CriarTipoModeloRequest) =>
    httpClient.post<TipoDeModelo>('/admin/tipos-modelo', payload),
  renomear: (id: string, payload: EditarTipoModeloRequest) =>
    httpClient.put<TipoDeModelo>(`/admin/tipos-modelo/${id}`, payload),
  ativar: (id: string) => httpClient.patch<TipoDeModelo>(`/admin/tipos-modelo/${id}/ativar`),
  desativar: (id: string) => httpClient.patch<TipoDeModelo>(`/admin/tipos-modelo/${id}/desativar`),
};
