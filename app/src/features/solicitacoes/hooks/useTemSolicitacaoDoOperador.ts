import { useQuery } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { solicitacoesKeys } from './solicitacoesKeys';

type Options = { enabled: boolean };

/**
 * Diz se o operador tem ao menos uma solicitação em qualquer status e período. Uma página de
 * tamanho 1, sem filtro: a API já restringe a listagem às solicitações do operador. Fica
 * debaixo de `lists()` para ser atualizada junto com as demais listas.
 */
export function useTemSolicitacaoDoOperador({ enabled }: Options) {
  const consulta = useQuery({
    queryKey: [...solicitacoesKeys.lists(), 'tem-solicitacao-do-operador'] as const,
    queryFn: () => solicitacoesApi.listar({ page: 0, size: 1 }),
    select: (pagina) => pagina.totalElements > 0,
    enabled,
  });

  return { data: consulta.data, isError: consulta.isError, isLoading: consulta.isLoading };
}
