import { httpClient } from '@/shared/api/httpClient';
import type { PageResponse } from '@/shared/types/page';

import type {
  AbrirSolicitacaoRequest,
  AtividadeSolicitacao,
  CancelarSolicitacaoRequest,
  ComentarioRequest,
  DevolverSolicitacaoRequest,
  EditarSolicitacaoRequest,
  EncerrarSolicitacaoRequest,
  MetricasResponse,
  Solicitacao,
  SolicitacoesFilters,
  TriarSolicitacaoRequest,
} from '../types/solicitacaoTypes';

export const solicitacoesApi = {
  listar: (filters: SolicitacoesFilters) =>
    httpClient.get<PageResponse<Solicitacao>>('/solicitacoes', { params: filters }),

  buscarPorId: (id: string) => httpClient.get<Solicitacao>(`/solicitacoes/${id}`),

  abrir: (payload: AbrirSolicitacaoRequest) =>
    httpClient.post<Solicitacao>('/solicitacoes', payload),

  editar: (id: string, payload: EditarSolicitacaoRequest) =>
    httpClient.put<Solicitacao>(`/solicitacoes/${id}`, payload),

  triar: (id: string, payload: TriarSolicitacaoRequest) =>
    httpClient.patch<Solicitacao>(`/solicitacoes/${id}/triar`, payload),

  enviarParaValidacao: (id: string) =>
    httpClient.patch<Solicitacao>(`/solicitacoes/${id}/enviar-validacao`),

  encerrar: (id: string, payload: EncerrarSolicitacaoRequest) =>
    httpClient.patch<Solicitacao>(`/solicitacoes/${id}/encerrar`, payload),

  cancelar: (id: string, payload: CancelarSolicitacaoRequest) =>
    httpClient.patch<Solicitacao>(`/solicitacoes/${id}/cancelar`, payload),

  devolver: (id: string, payload: DevolverSolicitacaoRequest) =>
    httpClient.patch<Solicitacao>(`/solicitacoes/${id}/devolver`, payload),

  comentar: (id: string, payload: ComentarioRequest) =>
    httpClient.post<void>(`/solicitacoes/${id}/comentarios`, payload),

  listarAtividades: (id: string) =>
    httpClient.get<AtividadeSolicitacao[]>(`/solicitacoes/${id}/atividades`),

  obterMetricas: () =>
    httpClient.get<MetricasResponse>('/solicitacoes/metricas'),

  exportar: (filters: SolicitacoesFilters) =>
    httpClient.get<Blob>('/solicitacoes/relatorio', { params: filters }),
};

