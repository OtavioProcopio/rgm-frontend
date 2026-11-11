import type { ModelosFilters } from '../types/modeloTypes';

export const modelosKeys = {
  all: ['admin', 'modelos'] as const,
  lists: () => [...modelosKeys.all, 'list'] as const,
  list: (filters: ModelosFilters) => [...modelosKeys.lists(), filters] as const,
  /** Debaixo de `lists()`: criar, ativar ou desativar um modelo muda as contagens. */
  resumo: () => [...modelosKeys.lists(), 'resumo'] as const,
  /** Catálogo de operação: debaixo de `lists()` para ativar ou desativar um modelo atualizá-lo. */
  catalogo: (filters: Omit<ModelosFilters, 'page' | 'size'>, paginaInicial: number) =>
    [...modelosKeys.lists(), 'catalogo', filters, paginaInicial] as const,
  contagens: (filters: Omit<ModelosFilters, 'page' | 'size' | 'ordem'>) =>
    [...modelosKeys.lists(), 'contagens', filters] as const,
  posicao: (id: string, filters: Omit<ModelosFilters, 'page' | 'size' | 'ordem'>) =>
    [...modelosKeys.lists(), 'posicao', id, filters] as const,
  details: () => [...modelosKeys.all, 'detail'] as const,
  detail: (id: string) => [...modelosKeys.details(), id] as const,
  eventos: (id: string) => [...modelosKeys.detail(id), 'eventos'] as const,
};
