import { useQuery } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import type {
  DadosDaTendencia,
  HistoricoMetricas,
  PainelPorPeriodo,
  PontoDaSerieDoPainel,
  PontoDaTendencia,
} from '../types/solicitacaoTypes';
import { usePainelPorPeriodo } from './usePainelPorPeriodo';

export type TendenciaDoPeriodoConsulta = {
  data: DadosDaTendencia | undefined;
  isPending: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
};

function pontoDoPainel(ponto: PontoDaSerieDoPainel): PontoDaTendencia {
  return {
    periodo: ponto.rotulo,
    total: ponto.criadas,
    abertas: ponto.abertasAoFimDoDia,
    concluidas: ponto.concluidas,
    canceladas: ponto.canceladas,
  };
}

function dadosDoPainel(painel: PainelPorPeriodo, dias: number): DadosDaTendencia {
  return {
    series: painel.periodo.serie.map(pontoDoPainel),
    periodoLabel: `Últimos ${dias} dias`,
    porDataDoEvento: true,
  };
}

function dadosDoHistorico(historico: HistoricoMetricas): DadosDaTendencia {
  return {
    series: historico.series,
    periodoLabel: historico.periodoLabel,
    porDataDoEvento: false,
  };
}

/** Plano da spec 013: histórico por data de criação, só consultado quando `enabled`. */
function useHistoricoDaCriacao(
  dias: number,
  modeloId: string | undefined,
  enabled: boolean,
): TendenciaDoPeriodoConsulta {
  const historico = useQuery({
    queryKey: ['solicitacoes', 'metricas', 'historico', dias, modeloId ?? null],
    queryFn: () => solicitacoesApi.obterHistoricoMetricas(dias, modeloId),
    enabled,
  });
  return {
    data: historico.data && dadosDoHistorico(historico.data),
    isPending: historico.isPending,
    isError: historico.isError,
    refetch: historico.refetch,
  };
}

/**
 * Série da tendência. Vem do painel (cada evento no seu dia); o histórico por data de criação
 * da spec 013 só entra quando o backend ainda não tem o painel (404).
 */
export function useHistoricoMetricas(dias: number, modeloId?: string): TendenciaDoPeriodoConsulta {
  const painel = usePainelPorPeriodo(dias, { modeloId });
  const historico = useHistoricoDaCriacao(dias, modeloId, painel.indisponivel);
  if (painel.indisponivel) return historico;
  return {
    data: painel.data && dadosDoPainel(painel.data, dias),
    isPending: painel.isLoading,
    isError: painel.isError,
    refetch: painel.refetch,
  };
}
