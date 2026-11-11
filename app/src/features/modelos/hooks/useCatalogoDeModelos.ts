import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import { modelosKeys } from '@/features/admin/modelos/hooks/modelosKeys';
import type { ModelosFilters } from '@/features/admin/modelos/types/modeloTypes';

import { TAMANHO_DO_BLOCO } from '../lib/filtrosDoCatalogo';

type Consulta = Omit<ModelosFilters, 'page' | 'size' | 'ordem'>;

/**
 * Os modelos do filtro, em ordem de código, carregados por blocos de 20 nos dois sentidos. A lista
 * começa no bloco `paginaInicial` (0 normalmente; outro quando o link aponta para um modelo do
 * meio). `total` é o do servidor, não o dos blocos carregados.
 */
export function useCatalogoDeModelos(consulta: Consulta, paginaInicial: number, habilitado = true) {
  const query = useInfiniteQuery({
    queryKey: modelosKeys.catalogo({ ...consulta, ordem: 'CODIGO' }, paginaInicial),
    queryFn: ({ pageParam }) =>
      modelosApi.listar({ ...consulta, ordem: 'CODIGO', page: pageParam, size: TAMANHO_DO_BLOCO }),
    initialPageParam: paginaInicial,
    getNextPageParam: (ultima) =>
      ultima.page + 1 < ultima.totalPages ? ultima.page + 1 : undefined,
    getPreviousPageParam: (primeira) => (primeira.page > 0 ? primeira.page - 1 : undefined),
    staleTime: 1000 * 60 * 5,
    enabled: habilitado,
  });

  const paginas = query.data?.pages;
  const modelos = useMemo(() => paginas?.flatMap((pagina) => pagina.content) ?? [], [paginas]);

  return {
    modelos,
    total: paginas?.[0]?.totalElements ?? 0,
    primeiraPagina: paginas?.[0]?.page ?? paginaInicial,
    carregando: query.isLoading,
    /** Falha sem nenhum bloco para mostrar. */
    erro: query.isError && !paginas,
    /** Falha ao buscar um bloco a mais; os blocos já carregados continuam na tela. */
    erroNoBloco: query.isFetchNextPageError || query.isFetchPreviousPageError,
    temMaisDepois: query.hasNextPage,
    temMaisAntes: query.hasPreviousPage,
    buscandoDepois: query.isFetchingNextPage,
    buscandoAntes: query.isFetchingPreviousPage,
    /** Carrega o bloco seguinte e devolve os modelos que ele trouxe (vazio se falhar). */
    carregarDepois: async () => {
      const resultado = await query.fetchNextPage();
      return resultado.isError ? [] : (resultado.data?.pages.at(-1)?.content ?? []);
    },
    /** Carrega o bloco anterior e devolve os modelos que ele trouxe (vazio se falhar). */
    carregarAntes: async () => {
      const resultado = await query.fetchPreviousPage();
      return resultado.isError ? [] : (resultado.data?.pages[0]?.content ?? []);
    },
    tentarDeNovo: () => void query.refetch(),
  };
}
