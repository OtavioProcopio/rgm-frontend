import { httpClient } from '@/shared/api/httpClient';
import type { PageResponse } from '@/shared/types/page';

import type {
  CriarUsuarioRequest,
  EditarUsuarioRequest,
  Usuario,
  UsuariosFilters,
} from '../types/usuarioTypes';

export const usuariosApi = {
  listar: (filters: UsuariosFilters) =>
    httpClient.get<PageResponse<Usuario>>('/admin/usuarios', { params: filters }),

  buscarPorId: (id: string) => httpClient.get<Usuario>(`/admin/usuarios/${id}`),

  criar: (payload: CriarUsuarioRequest) =>
    httpClient.post<Usuario>('/admin/usuarios', normalizeCreatePayload(payload)),

  editar: (id: string, payload: EditarUsuarioRequest) =>
    httpClient.put<Usuario>(`/admin/usuarios/${id}`, payload),

  ativar: (id: string) => httpClient.patch<Usuario>(`/admin/usuarios/${id}/ativar`),

  desativar: (id: string) => httpClient.patch<Usuario>(`/admin/usuarios/${id}/desativar`),

  excluir: (id: string) =>
    httpClient.delete<void>('/admin/registros', {
      tipoRecurso: 'USUARIO',
      recursoId: id,
    }),
};

function normalizeCreatePayload(payload: CriarUsuarioRequest): CriarUsuarioRequest {
  if (payload.perfil === 'EXTERNO') {
    return {
      nome: payload.nome,
      perfil: payload.perfil,
      ativo: payload.ativo,
    };
  }

  return payload;
}
