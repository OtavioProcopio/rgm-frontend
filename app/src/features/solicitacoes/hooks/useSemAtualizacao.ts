import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { solicitacoesKeys } from './solicitacoesKeys';
import type { EstadoDaConexao } from './useSolicitacaoEvents';

/** Tempo de conexão fechada a partir do qual a tela avisa que não se atualiza sozinha. */
const TOLERANCIA_MS = 10_000;

/**
 * Diz se a conexão de tempo real está fechada há tempo demais. Queda curta, que a
 * reconexão resolve, não conta.
 */
export function useSemAtualizacao(): boolean {
  const { data: conexao } = useQuery<EstadoDaConexao>({
    queryKey: solicitacoesKeys.conexao(),
    enabled: false,
  });
  // Instante da queda cuja tolerância já venceu.
  const [quedaVencida, setQuedaVencida] = useState<number | null>(null);

  const quedaDesde = conexao && !conexao.aberta ? conexao.desde : null;

  useEffect(() => {
    if (quedaDesde === null) return;
    const falta = Math.max(quedaDesde + TOLERANCIA_MS - Date.now(), 0);
    const timer = setTimeout(() => setQuedaVencida(quedaDesde), falta);
    return () => clearTimeout(timer);
  }, [quedaDesde]);

  return quedaDesde !== null && quedaVencida === quedaDesde;
}
