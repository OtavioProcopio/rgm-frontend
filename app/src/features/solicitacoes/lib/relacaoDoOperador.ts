import type { Solicitacao } from '../types/solicitacaoTypes';

/** O que liga o operador a uma solicitação que ele vê no quadro. */
export type RelacaoDoOperador = 'ABERTA' | 'ATRIBUIDA';

export const ROTULO_DA_RELACAO: Record<RelacaoDoOperador, string> = {
  ABERTA: 'Aberta por você',
  ATRIBUIDA: 'Atribuída a você',
};

/**
 * Relação do operador com a solicitação. Ser responsável vem primeiro: é o caso em que há
 * trabalho para ele, mesmo que também tenha aberto a solicitação.
 */
export function relacaoDoOperador(
  solicitacao: Pick<Solicitacao, 'abertaPorUsuarioId' | 'responsavelIds'>,
  usuarioId: string | undefined,
): RelacaoDoOperador | null {
  if (!usuarioId) return null;
  if (solicitacao.responsavelIds.includes(usuarioId)) return 'ATRIBUIDA';
  if (solicitacao.abertaPorUsuarioId === usuarioId) return 'ABERTA';
  return null;
}
