import type { ModelosFilters } from '../types/modeloTypes';

export const modelosKeys = {
  all: ['admin', 'modelos'] as const,
  lists: () => [...modelosKeys.all, 'list'] as const,
  list: (filters: ModelosFilters) => [...modelosKeys.lists(), filters] as const,
  details: () => [...modelosKeys.all, 'detail'] as const,
  detail: (id: string) => [...modelosKeys.details(), id] as const,
  eventos: (id: string) => [...modelosKeys.detail(id), 'eventos'] as const,
};
