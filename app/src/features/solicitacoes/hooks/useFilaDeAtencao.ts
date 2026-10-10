import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { itensDaFila, LIMITE_DA_CONSULTA, type ItemDaFila } from '../lib/filaDeAtencao';
import type { PageResponse } from '@/shared/types/page';

import type { Solicitacao, SolicitacoesFilters } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

export type FilaDeAtencao = {
  itens: ItemDaFila[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  dataUpdatedAt: number;
};

const FILTROS_DA_FILA: SolicitacoesFilters = {
  atrasada: true,
  emAberto: true,
  page: 0,
  size: LIMITE_DA_CONSULTA,
};

function useItensDaFila(
  data: PageResponse<Solicitacao> | undefined,
  dataUpdatedAt: number,
): ItemDaFila[] {
  return useMemo(
    () => (data ? itensDaFila(data.content, dataUpdatedAt) : []),
    [data, dataUpdatedAt],
  );
}

function useRefazerSemRetorno(refazer: () => Promise<unknown>): () => void {
  return useCallback((): void => {
    void refazer();
  }, [refazer]);
}

export function useFilaDeAtencao(options: { enabled?: boolean } = {}): FilaDeAtencao {
  const query = useQuery({
    queryKey: solicitacoesKeys.list(FILTROS_DA_FILA),
    queryFn: () => solicitacoesApi.listar(FILTROS_DA_FILA),
    enabled: options.enabled ?? true,
  });
  const { data, dataUpdatedAt, refetch: refazer } = query;
  const itens = useItensDaFila(data, dataUpdatedAt);
  const refetch = useRefazerSemRetorno(refazer);
  return {
    itens,
    total: data?.totalElements ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch,
    dataUpdatedAt,
  };
}
