import { httpClient } from '@/shared/api/httpClient';
import type { PageResponse } from '@/shared/types/page';

import type {
  AbrirSolicitacaoRequest,
  AlterarResponsaveisRequest,
  AtividadeSolicitacao,
  CancelarSolicitacaoRequest,
  ComentarioRequest,
  DevolverSolicitacaoRequest,
  EditarSolicitacaoRequest,
  EncerrarSolicitacaoRequest,
  EnviarParaValidacaoRequest,
  HistoricoMetricas,
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

  enviarParaValidacao: (id: string, payload: EnviarParaValidacaoRequest) =>
    httpClient.patch<Solicitacao>(`/solicitacoes/${id}/enviar-validacao`, payload),

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

  alterarResponsaveis: (id: string, payload: AlterarResponsaveisRequest) =>
    httpClient.patch<Solicitacao>(`/solicitacoes/${id}/responsaveis`, payload),

  obterMetricas: () =>
    httpClient.get<MetricasResponse>('/solicitacoes/metricas'),

  obterHistoricoMetricas: (dias: number, modeloId?: string) =>
    httpClient.get<HistoricoMetricas>('/solicitacoes/metricas/historico', {
      params: { dias, modeloId },
    }),

  exportar: (filters: SolicitacoesFilters) =>
    httpClient.get<Blob>('/solicitacoes/relatorio', { params: filters }),
};

