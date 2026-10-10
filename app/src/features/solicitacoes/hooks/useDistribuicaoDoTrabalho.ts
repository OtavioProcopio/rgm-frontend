import { useQueries, type UseQueryResult } from '@tanstack/react-query';

import type { PageResponse } from '@/shared/types/page';

import { solicitacoesApi } from '../api/solicitacoesApi';
import {
  partesPorConsulta,
  partesPorStatus,
  visaoPorId,
  type ParteContada,
  type ParteDaDistribuicao,
  type VisaoDaDistribuicao,
} from '../lib/distribuicaoDoTrabalho';
import type { MetricasResponse, Solicitacao, SolicitacoesFilters } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

export type { ParteContada };
export type DistribuicaoDoTrabalho = {
  partes: ParteContada[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

const TAMANHO_DA_CONTAGEM = 1;

function filtrosDaParte(visao: VisaoDaDistribuicao, valor: string): SolicitacoesFilters {
  const { parametro } = visaoPorId(visao);
  return { emAberto: true, [parametro]: valor, page: 0, size: TAMANHO_DA_CONTAGEM };
}

function useContagens(
  visao: VisaoDaDistribuicao,
  partes: ParteDaDistribuicao[],
): UseQueryResult<PageResponse<Solicitacao>>[] {
  return useQueries({
    queries: partes.map((parte) => {
      const filtros = filtrosDaParte(visao, parte.valor);
      return {
        queryKey: solicitacoesKeys.list(filtros),
        queryFn: () => solicitacoesApi.listar(filtros),
      };
    }),
  });
}

export function useDistribuicaoDoTrabalho(
  visao: VisaoDaDistribuicao,
  metricas: MetricasResponse | undefined,
): DistribuicaoDoTrabalho {
  const partesDaVisao = visao === 'status' ? [] : visaoPorId(visao).partes;
  const consultas = useContagens(visao, partesDaVisao);
  if (visao === 'status') {
    const partes = partesPorStatus(metricas);
    return { partes, isLoading: false, isError: false, refetch: () => {} };
  }
  const totais = consultas.map((consulta) => consulta.data?.totalElements);
  const partes = partesPorConsulta(partesDaVisao, totais);
  return {
    partes,
    isLoading: consultas.some((consulta) => consulta.isPending),
    isError: consultas.some((consulta) => consulta.isError),
    refetch: () => consultas.forEach((consulta) => void consulta.refetch()),
  };
}
