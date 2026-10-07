import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { filtrosDaColuna, type FiltrosDoQuadro } from '../lib/filtrosDaColuna';
import type { Solicitacao, StatusSolicitacao } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

export type ColunaDoQuadro = {
  cards: Solicitacao[];
  /** Total de solicitações do status, carregadas ou não. */
  total: number;
  temMais: boolean;
  carregando: boolean;
  carregandoMais: boolean;
  /** Falha na primeira carga da coluna: não há o que mostrar. */
  erro: unknown;
  /** Falha ao buscar o bloco seguinte: os cards já carregados continuam na tela. */
  falhouAoCarregarMais: boolean;
  carregarMais: () => void;
};

/** As cinco colunas do quadro, cada uma com a sua consulta em blocos. */
export function useColunasDoQuadro(
  quadro: FiltrosDoQuadro,
  inicioDos30Dias: string,
): Record<StatusSolicitacao, ColunaDoQuadro> {
  return {
    A_FAZER: useColunaDoQuadro('A_FAZER', quadro, inicioDos30Dias),
    EM_ANDAMENTO: useColunaDoQuadro('EM_ANDAMENTO', quadro, inicioDos30Dias),
    EM_VALIDACAO: useColunaDoQuadro('EM_VALIDACAO', quadro, inicioDos30Dias),
    CONCLUIDA: useColunaDoQuadro('CONCLUIDA', quadro, inicioDos30Dias),
    CANCELADA: useColunaDoQuadro('CANCELADA', quadro, inicioDos30Dias),
  };
}

/**
 * Solicitações de um status do quadro, em blocos. Uma ação ou um evento de tempo real que
 * atualize as listas refaz todos os blocos já carregados, sem voltar ao primeiro.
 */
export function useColunaDoQuadro(
  status: StatusSolicitacao,
  quadro: FiltrosDoQuadro,
  inicioDos30Dias: string,
): ColunaDoQuadro {
  const consulta = useInfiniteQuery({
    // A chave usa sempre a primeira página: cada bloco é uma página da mesma consulta.
    queryKey: solicitacoesKeys.coluna(filtrosDaColuna(status, quadro, inicioDos30Dias, 0)),
    queryFn: ({ pageParam }) =>
      solicitacoesApi.listar(filtrosDaColuna(status, quadro, inicioDos30Dias, pageParam)),
    initialPageParam: 0,
    getNextPageParam: (ultima) => (ultima.page + 1 < ultima.totalPages ? ultima.page + 1 : undefined),
  });

  const cards = useMemo(() => {
    // Um card que muda de posição entre a busca de dois blocos pode vir nos dois.
    const vistos = new Set<string>();
    return (consulta.data?.pages ?? [])
      .flatMap((bloco) => bloco.content)
      .filter((card) => (vistos.has(card.id) ? false : vistos.add(card.id)));
  }, [consulta.data]);

  return {
    cards,
    total: consulta.data?.pages[0]?.totalElements ?? 0,
    temMais: consulta.hasNextPage,
    carregando: consulta.isLoading,
    carregandoMais: consulta.isFetchingNextPage,
    erro: consulta.data ? null : consulta.error,
    falhouAoCarregarMais: consulta.isFetchNextPageError,
    carregarMais: () => {
      void consulta.fetchNextPage();
    },
  };
}
