import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { PageResponse } from '@/shared/types/page';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { LIMITE_DA_AMOSTRA, resumoDasPaginas } from '../lib/leituraDosIndicadores';
import type { TempoMedio } from '../lib/leituraDosIndicadores';
import { intervalosDoPeriodo } from '../lib/periodoDoPainel';
import type { Intervalo } from '../lib/periodoDoPainel';
import type { Solicitacao, SolicitacoesFilters } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

export type IndicadoresDoPeriodo = {
  concluidas: { atual: number; anterior: number } | undefined;
  tempoMedio: { atual: TempoMedio | null; anterior: TempoMedio | null } | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

function filtrosDasConcluidas(intervalo: Intervalo): SolicitacoesFilters {
  return {
    status: 'CONCLUIDA',
    tipoData: 'CONCLUSAO',
    dataInicio: intervalo.inicio,
    dataFim: intervalo.fim,
    page: 0,
    size: LIMITE_DA_AMOSTRA,
  };
}

function useConcluidasDoIntervalo(intervalo: Intervalo): UseQueryResult<PageResponse<Solicitacao>> {
  const filtros: SolicitacoesFilters = filtrosDasConcluidas(intervalo);
  return useQuery({
    queryKey: solicitacoesKeys.list(filtros),
    queryFn: () => solicitacoesApi.listar(filtros),
  });
}

export function useIndicadoresDoPeriodo(dias: number): IndicadoresDoPeriodo {
  const intervalos = intervalosDoPeriodo(dias, new Date());
  const atual = useConcluidasDoIntervalo(intervalos.atual);
  const anterior = useConcluidasDoIntervalo(intervalos.anterior);

  return {
    ...resumoDasPaginas(atual.data, anterior.data),
    isLoading: atual.isPending || anterior.isPending,
    isError: atual.isError || anterior.isError,
    refetch: () => {
      void atual.refetch();
      void anterior.refetch();
    },
  };
}
