import { useQuery } from '@tanstack/react-query';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';

import { solicitacoesKeys } from './solicitacoesKeys';

/** Resumo das solicitações de um modelo, sem trazer a lista delas. */
export function useResumoDasSolicitacoesDoModelo(modeloId?: string | null) {
  return useQuery({
    queryKey: solicitacoesKeys.resumoDoModelo(modeloId ?? ''),
    queryFn: () => modelosApi.obterResumoDasSolicitacoes(modeloId ?? ''),
    enabled: Boolean(modeloId),
  });
}
