import {
  partesPorMetricas,
  partesPorStatus,
  type ParteContada,
  type VisaoDaDistribuicao,
} from '../lib/distribuicaoDoTrabalho';
import type { MetricasResponse } from '../types/solicitacaoTypes';

export type { ParteContada };
export type DistribuicaoDoTrabalho = { partes: ParteContada[] | undefined };

/**
 * Distribuição do trabalho em aberto. As três visões saem da mesma resposta de métricas,
 * por isso os números batem entre si e não há requisição por parte.
 */
export function useDistribuicaoDoTrabalho(
  visao: VisaoDaDistribuicao,
  metricas: MetricasResponse | undefined,
): DistribuicaoDoTrabalho {
  const partes =
    visao === 'status' ? partesPorStatus(metricas) : partesPorMetricas(visao, metricas);
  return { partes };
}
