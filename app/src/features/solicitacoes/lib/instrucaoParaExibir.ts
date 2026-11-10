import type { Solicitacao, StatusSolicitacao } from '../types/solicitacaoTypes';

export type InstrucaoParaExibir =
  { tipo: 'instrucao'; texto: string } | { tipo: 'semRegistro' } | { tipo: 'nenhuma' };

/** Status de quem já foi triado: a instrução deveria existir, salvo nas triadas antes do campo. */
const JA_TRIADAS: readonly StatusSolicitacao[] = ['EM_ANDAMENTO', 'EM_VALIDACAO', 'CONCLUIDA'];

/**
 * O que o detalhe mostra sobre a instrução. A cancelada sem instrução pode nunca ter sido triada,
 * então não ganha aviso; a ainda a fazer não tem instrução por definição.
 */
export function instrucaoParaExibir(
  solicitacao: Pick<Solicitacao, 'status' | 'instrucao'>,
): InstrucaoParaExibir {
  const texto = solicitacao.instrucao?.trim();
  if (texto) return { tipo: 'instrucao', texto };
  return JA_TRIADAS.includes(solicitacao.status) ? { tipo: 'semRegistro' } : { tipo: 'nenhuma' };
}
