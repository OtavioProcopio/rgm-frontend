import { httpClient } from '@/shared/api/httpClient';
import type { PageResponse } from '@/shared/types/page';

export type ResponsavelDisponivel = {
  id: string;
  nome: string;
  perfil: 'OPERADOR' | 'GESTOR';
};

export type BuscaDeResponsaveis = {
  busca?: string;
  page: number;
  size: number;
};

export const responsaveisDisponiveisApi = {
  listar: (params: BuscaDeResponsaveis) =>
    httpClient.get<PageResponse<ResponsavelDisponivel>>('/solicitacoes/responsaveis-disponiveis', {
      params,
    }),
};
