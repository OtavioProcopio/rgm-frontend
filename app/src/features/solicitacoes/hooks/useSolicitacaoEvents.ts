import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuth } from '@/app/providers/authContext';
import { evidenciasKeys } from '@/features/evidencias/hooks/evidenciasKeys';
import { authToken } from '@/shared/api/authToken';
import { refreshAccessToken } from '@/shared/api/httpClient';
import { env } from '@/shared/config/env';

import {
  lerEventoAtividade,
  lerEventoSolicitacao,
  mesclarSolicitacaoDoEvento,
} from '../lib/eventosSolicitacao';
import type { Solicitacao } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

const RECONNECT_DELAY_MS = 3000;

export function useSolicitacaoEvents() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }

    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const handleSolicitacao = (event: Event) => {
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() });

      const evento = lerEventoSolicitacao((event as MessageEvent).data);
      if (!evento) return;
      const { id } = evento.solicitacao;

      // Mostra já o que veio no evento e confirma com a consulta do detalhe e do histórico.
      queryClient.setQueryData<Solicitacao>(solicitacoesKeys.detail(id), (atual) =>
        atual ? mesclarSolicitacaoDoEvento(atual, evento) : atual,
      );
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.detail(id) });
      queryClient.setQueryData<number>(solicitacoesKeys.atualizacao(id), (marca = 0) => marca + 1);
    };

    const handleAtividade = (event: Event) => {
      const evento = lerEventoAtividade((event as MessageEvent).data);
      if (!evento) return;
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.atividades(evento.solicitacaoId) });
      queryClient.invalidateQueries({
        queryKey: evidenciasKeys.bySolicitacao(evento.solicitacaoId),
      });
    };

    function connect(token: string) {
      const url = `${env.apiBaseUrl}/solicitacoes/events?token=${encodeURIComponent(token)}`;
      source = new EventSource(url);
      source.addEventListener('solicitacao', handleSolicitacao);
      source.addEventListener('solicitacao_atividade', handleAtividade);
      source.onerror = () => {
        // readyState CLOSED (resposta nao-2xx, ex.: token expirado) significa
        // que o browser NAO vai tentar reconectar sozinho — precisamos buscar
        // um token novo e recriar a conexao manualmente.
        if (cancelled || source?.readyState !== EventSource.CLOSED) {
          return;
        }
        source.close();
        scheduleReconnect();
      };
    }

    function scheduleReconnect() {
      reconnectTimer = setTimeout(() => {
        if (cancelled) {
          return;
        }
        refreshAccessToken()
          .then(() => {
            const freshToken = authToken.getAccessToken();
            if (!cancelled && freshToken) {
              connect(freshToken);
            }
          })
          .catch(() => {
            // sessao realmente expirada; um novo login recria o hook via `user`
          });
      }, RECONNECT_DELAY_MS);
    }

    const initialToken = authToken.getAccessToken();
    if (initialToken) {
      connect(initialToken);
    }

    return () => {
      cancelled = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      source?.removeEventListener('solicitacao', handleSolicitacao);
      source?.removeEventListener('solicitacao_atividade', handleAtividade);
      source?.close();
    };
  }, [queryClient, user]);
}
