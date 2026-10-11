import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { PageResponse } from '@/shared/types/page';

import { solicitacoesApi } from '../api/solicitacoesApi';
import {
  LIMITE_DA_AMOSTRA,
  resumoDasPaginas,
  type ResumoDoPeriodo,
  type TempoMedio,
} from '../lib/leituraDosIndicadores';
import { intervalosDoPeriodo } from '../lib/periodoDoPainel';
import type { Intervalo } from '../lib/periodoDoPainel';
import type { PainelPorPeriodo, Solicitacao, SolicitacoesFilters } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';
import { usePainelPorPeriodo } from './usePainelPorPeriodo';

export type IndicadoresDoPeriodo = ResumoDoPeriodo & {
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

function useConcluidasDoIntervalo(
  intervalo: Intervalo,
  enabled: boolean,
): UseQueryResult<PageResponse<Solicitacao>> {
  const filtros: SolicitacoesFilters = filtrosDasConcluidas(intervalo);
  return useQuery({
    queryKey: solicitacoesKeys.list(filtros),
    queryFn: () => solicitacoesApi.listar(filtros),
    enabled,
  });
}

function tempoDoPainel(segundos: number | null): TempoMedio | null {
  return segundos === null ? null : { segundos, amostra: null };
}

function resumoDoPainel(painel: PainelPorPeriodo | undefined): ResumoDoPeriodo {
  if (!painel) return { concluidas: undefined, tempoMedio: undefined };
  const { periodo, anterior } = painel;
  return {
    concluidas: { atual: periodo.concluidas, anterior: anterior.concluidas },
    tempoMedio: {
      atual: tempoDoPainel(periodo.tempoMedioResolucaoSegundos),
      anterior: tempoDoPainel(anterior.tempoMedioResolucaoSegundos),
    },
  };
}

/** Plano da spec 013: duas listagens de concluídas, só consultadas quando `enabled`. */
function useIndicadoresDaListagem(dias: number, enabled: boolean): IndicadoresDoPeriodo {
  const intervalos = intervalosDoPeriodo(dias, new Date());
  const atual = useConcluidasDoIntervalo(intervalos.atual, enabled);
  const anterior = useConcluidasDoIntervalo(intervalos.anterior, enabled);
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

/**
 * Concluídas e tempo médio do período e do anterior. Vêm do painel; as listagens da spec 013
 * só entram quando o backend ainda não tem o painel (404).
 */
export function useIndicadoresDoPeriodo(dias: number): IndicadoresDoPeriodo {
  const painel = usePainelPorPeriodo(dias);
  const listagem = useIndicadoresDaListagem(dias, painel.indisponivel);
  if (painel.indisponivel) return listagem;
  return {
    ...resumoDoPainel(painel.data),
    isLoading: painel.isLoading,
    isError: painel.isError,
    refetch: () => void painel.refetch(),
  };
}
