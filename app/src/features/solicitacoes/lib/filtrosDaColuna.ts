import { DIA_MS } from '@/shared/lib/duracao';

import type { SolicitacoesFilters, StatusSolicitacao } from '../types/solicitacaoTypes';

/** Quantas solicitações cada coluna do quadro carrega por vez. */
export const TAMANHO_DO_BLOCO = 20;

const DIAS_DAS_ENCERRADAS = 30;

/** Filtros que o usuário escolhe para o quadro inteiro. */
export type FiltrosDoQuadro = Pick<
  SolicitacoesFilters,
  'modeloId' | 'criadaEmInicio' | 'criadaEmFim'
>;

const ENCERRADAS: ReadonlySet<StatusSolicitacao> = new Set(['CONCLUIDA', 'CANCELADA']);

/** Diz se a coluna mostra só as encerradas dos últimos 30 dias: vale enquanto não há período. */
export function colunaLimitadaAos30Dias(status: StatusSolicitacao, quadro: FiltrosDoQuadro) {
  return ENCERRADAS.has(status) && !quadro.criadaEmInicio && !quadro.criadaEmFim;
}

/**
 * Início do dia (UTC) de 30 dias antes de `agora`. Truncado para o dia para que o valor,
 * que entra na chave da consulta, não mude a cada vez que o quadro é desenhado.
 */
export function inicioDosUltimos30Dias(agora: Date): string {
  const dia = Math.floor(agora.getTime() / DIA_MS) - DIAS_DAS_ENCERRADAS;
  return new Date(dia * DIA_MS).toISOString();
}

/** Filtros da listagem para um bloco de uma coluna do quadro. */
export function filtrosDaColuna(
  status: StatusSolicitacao,
  quadro: FiltrosDoQuadro,
  inicioDos30Dias: string,
  page: number,
): SolicitacoesFilters {
  return {
    status,
    page,
    size: TAMANHO_DO_BLOCO,
    ...(quadro.modeloId ? { modeloId: quadro.modeloId } : {}),
    ...(quadro.criadaEmInicio ? { criadaEmInicio: quadro.criadaEmInicio } : {}),
    ...(quadro.criadaEmFim ? { criadaEmFim: quadro.criadaEmFim } : {}),
    ...(colunaLimitadaAos30Dias(status, quadro)
      ? { tipoData: 'CONCLUSAO' as const, dataInicio: inicioDos30Dias }
      : {}),
  };
}
