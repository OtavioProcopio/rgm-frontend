import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { authToken } from '@/shared/api/authToken';
import { env } from '@/shared/config/env';

import { solicitacoesKeys } from './solicitacoesKeys';

export function useSolicitacaoEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = authToken.getAccessToken();
    if (!token) {
      return;
    }

    const url = `${env.apiBaseUrl}/solicitacoes/events?token=${encodeURIComponent(token)}`;
    const source = new EventSource(url);

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() });
    };

    source.addEventListener('solicitacao', handleUpdate);

    return () => {
      source.removeEventListener('solicitacao', handleUpdate);
      source.close();
    };
  }, [queryClient]);
}
