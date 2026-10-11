import { useCallback } from 'react';

import { useAuth } from '@/app/providers/authContext';
import { usePerfil } from '@/features/auth/hooks/usePerfil';

import { acoesPermitidas, type AcaoSolicitacao } from '../lib/acoesSolicitacao';
import type { Solicitacao } from '../types/solicitacaoTypes';

/** Devolve a função que calcula as ações do usuário autenticado sobre uma solicitação. */
export function useAcoesPermitidas() {
  const { user } = useAuth();
  const { data: perfil } = usePerfil();
  const usuarioId = perfil?.id;
  const perfilUsuario = user?.perfil;

  return useCallback(
    (solicitacao: Solicitacao): ReadonlySet<AcaoSolicitacao> =>
      acoesPermitidas(solicitacao, { id: usuarioId, perfil: perfilUsuario }),
    [usuarioId, perfilUsuario],
  );
}
