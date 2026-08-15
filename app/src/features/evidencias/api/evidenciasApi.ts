import { httpClient } from '@/shared/api/httpClient';

import type { Evidencia, TipoEvidencia } from '../types/evidenciaTypes';

export type AnexarEvidenciaOptions = {
  tipo?: TipoEvidencia;
  descricao?: string;
};

export const evidenciasApi = {
  listar: (solicitacaoId: string) =>
    httpClient.get<Evidencia[]>(`/solicitacoes/${solicitacaoId}/evidencias`),

  anexar: (solicitacaoId: string, file: File, options?: AnexarEvidenciaOptions) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.tipo) formData.append('tipo', options.tipo);
    if (options?.descricao) formData.append('descricao', options.descricao);
    return httpClient.post<Evidencia>(`/solicitacoes/${solicitacaoId}/evidencias`, formData);
  },

  excluir: (solicitacaoId: string, evidenciaId: string) =>
    httpClient.delete<void>(`/solicitacoes/${solicitacaoId}/evidencias/${evidenciaId}`),
};
