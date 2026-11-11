import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import {
  FILTROS_PADRAO,
  escreverFiltros,
  lerFiltros,
  type FiltrosDoCatalogo,
} from '../lib/filtrosDoCatalogo';

/**
 * Filtros e modelo em destaque, guardados no endereço da página. Botão de filtro cria uma entrada
 * no histórico do navegador; busca, "Mostrar inativos" e a troca de modelo substituem a atual.
 * Trocar qualquer filtro tira o modelo do endereço: o primeiro do novo resultado assume.
 */
export function useFiltrosDoCatalogo() {
  const [params, setParams] = useSearchParams();
  const filtros = useMemo(() => lerFiltros(params), [params]);

  const atualizar = useCallback(
    (mudanca: Partial<FiltrosDoCatalogo>, substituir: boolean) => {
      setParams((atual) => escreverFiltros({ ...lerFiltros(atual), ...mudanca }), {
        replace: substituir,
      });
    },
    [setParams],
  );

  return {
    filtros,
    /** Clicar no tipo já escolhido (ou em "Todos") volta a todos. */
    escolherTipo: (tipo: string) =>
      atualizar({ tipo: tipo === filtros.tipo ? '' : tipo, modelo: '' }, false),
    escolherMaquina: (maquina: string) =>
      atualizar({ maquina: maquina === filtros.maquina ? '' : maquina, modelo: '' }, false),
    definirBusca: (q: string) => atualizar({ q, modelo: '' }, true),
    definirInativos: (inativos: boolean) => atualizar({ inativos, modelo: '' }, true),
    definirModelo: (modelo: string) => atualizar({ modelo }, true),
    /** Troca vários de uma vez, sem criar entrada no histórico (link para modelo fora do filtro). */
    substituirFiltros: (mudanca: Partial<FiltrosDoCatalogo>) => atualizar(mudanca, true),
    limpar: () => atualizar({ ...FILTROS_PADRAO }, false),
  };
}
