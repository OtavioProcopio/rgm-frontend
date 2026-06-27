import { useQuery } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useKanbanSolicitacoes(modeloId?: string) {
  const filters = { page: 0, size: 200, ...(modeloId ? { modeloId } : {}) };
  return useQuery({
    queryKey: solicitacoesKeys.list(filters),
    queryFn: () => solicitacoesApi.listar(filters),
    select: (data) => data.content,
  });
}
