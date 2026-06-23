import { httpClient } from '@/shared/api/httpClient';

import type { Evidencia } from '../types/evidenciaTypes';

export const evidenciasApi = {
  listar: (solicitacaoId: string) =>
    httpClient.get<Evidencia[]>(`/solicitacoes/${solicitacaoId}/evidencias`),

  anexar: (solicitacaoId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return httpClient.post<Evidencia>(`/solicitacoes/${solicitacaoId}/evidencias`, formData);
  },
};
