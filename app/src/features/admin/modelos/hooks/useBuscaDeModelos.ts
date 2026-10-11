import { useDebounce } from '@/shared/hooks/useDebounce';

import type { ModelosFilters } from '../types/modeloTypes';
import { useModelos } from './useModelos';

/** Quantos modelos a busca traz por vez. */
export const MODELOS_POR_BUSCA = 20;
/** Espera depois da última tecla antes de buscar. */
export const ESPERA_DA_BUSCA_MS = 300;

/**
 * Modelos ativos cujo código contém o termo digitado. A busca só sai depois de o usuário
 * parar de digitar, e nunca traz a lista inteira.
 */
export function useBuscaDeModelos(termo: string) {
  const digitado = termo.trim();
  const codigo = useDebounce(digitado, ESPERA_DA_BUSCA_MS);
  const filtros: ModelosFilters = {
    page: 0,
    size: MODELOS_POR_BUSCA,
    ativo: true,
    ...(codigo ? { codigo } : {}),
  };
  const { data, isFetching } = useModelos(filtros);

  return {
    modelos: data?.content ?? [],
    buscando: Boolean(isFetching) || codigo !== digitado,
  };
}
