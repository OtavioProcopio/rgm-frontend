import type { SolicitacoesFilters } from '../types/solicitacaoTypes';

/** Há filtro ativo quando qualquer campo, além da paginação, tem valor. */
export function temFiltroAtivo(filters: SolicitacoesFilters): boolean {
  return Object.entries(filters).some(
    ([campo, valor]) => campo !== 'page' && campo !== 'size' && valor !== undefined && valor !== '',
  );
}
