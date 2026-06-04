import type { MaquinasFilters } from '../types/maquinaTypes';

export const maquinasKeys = {
  all: ['admin', 'maquinas'] as const,
  lists: () => [...maquinasKeys.all, 'list'] as const,
  list: (filters: MaquinasFilters) => [...maquinasKeys.lists(), filters] as const,
  details: () => [...maquinasKeys.all, 'detail'] as const,
  detail: (id: string) => [...maquinasKeys.details(), id] as const,
};
