import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import { AuthContext } from '@/app/providers/authContext';
import { ApiError } from '@/shared/api/apiError';

import { solicitacoesApi } from '../api/solicitacoesApi';
import type { PainelPorPeriodo } from '../types/solicitacaoTypes';

const NAO_ENCONTRADO = 404;

export type PainelDoPeriodo = {
  data: PainelPorPeriodo | undefined;
  isLoading: boolean;
  /** Falha que não é "painel inexistente": o bloco mostra o erro, sem trocar de fonte. */
  isError: boolean;
  /** Verdadeiro só quando o backend responde 404, isto é, ainda não tem o painel. */
  indisponivel: boolean;
  refetch: () => Promise<unknown>;
};

type Opcoes = { enabled?: boolean; modeloId?: string };

function ehNaoEncontrado(erro: unknown): boolean {
  return erro instanceof ApiError && erro.status === NAO_ENCONTRADO;
}

function chaveDoPainel(dias: number, modeloId?: string) {
  return ['solicitacoes', 'metricas', 'painel', dias, modeloId ?? null] as const;
}

export function usePainelPorPeriodo(dias: number, opcoes: Opcoes = {}): PainelDoPeriodo {
  const perfil = useContext(AuthContext)?.user?.perfil;
  const { enabled = true, modeloId } = opcoes;
  const consulta = useQuery({
    queryKey: chaveDoPainel(dias, modeloId),
    // 404 é a resposta de "backend sem painel": vira `null` em vez de erro, para não ser
    // repetido pela política de retentativa e cair logo no plano da spec 013.
    queryFn: async () => {
      try {
        return await solicitacoesApi.obterPainel(dias, modeloId);
      } catch (erro) {
        if (ehNaoEncontrado(erro)) return null;
        throw erro;
      }
    },
    // O painel é do gestor e do administrador: para o operador a API responde 403.
    enabled: enabled && perfil !== 'OPERADOR',
  });
  const indisponivel: boolean = consulta.data === null;
  return {
    data: consulta.data ?? undefined,
    isLoading: consulta.isLoading,
    isError: consulta.isError,
    indisponivel,
    refetch: consulta.refetch,
  };
}
