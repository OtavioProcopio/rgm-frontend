import { useQuery } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useKanbanSolicitacoes(
  modeloId?: string,
  options: { enabled?: boolean; dataInicio?: string; dataFim?: string } = {},
) {
  const filters = {
    page: 0,
    size: 200,
    ...(modeloId ? { modeloId } : {}),
    ...(options.dataInicio ? { criadaEmInicio: options.dataInicio } : {}),
    ...(options.dataFim ? { criadaEmFim: options.dataFim } : {}),
  };
  return useQuery({
    queryKey: solicitacoesKeys.list(filters),
    queryFn: () => solicitacoesApi.listar(filters),
    select: (data) => data.content,
    enabled: options.enabled ?? true,
  });
}
