import { useQuery } from '@tanstack/react-query';

import { evidenciasApi } from '../api/evidenciasApi';
import { evidenciasKeys } from './evidenciasKeys';

export function useEvidencias(solicitacaoId: string) {
  return useQuery({
    queryKey: evidenciasKeys.bySolicitacao(solicitacaoId),
    queryFn: () => evidenciasApi.listar(solicitacaoId),
    enabled: Boolean(solicitacaoId),
  });
}
