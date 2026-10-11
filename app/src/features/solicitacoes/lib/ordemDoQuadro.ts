import type { SolicitacoesFilters, StatusSolicitacao } from '../types/solicitacaoTypes';

export type OrdemDaColuna = {
  sort: NonNullable<SolicitacoesFilters['sort']>;
  dir: NonNullable<SolicitacoesFilters['dir']>;
  /** Frase curta que o cabeçalho da coluna mostra. */
  texto: string;
};

const POR_PRAZO: OrdemDaColuna = {
  sort: 'prazoLimite',
  dir: 'asc',
  texto: 'prazo mais vencido primeiro',
};

/**
 * Única fonte da ordem de cada coluna: a consulta e o texto do cabeçalho leem daqui.
 * Concluída e Cancelada seguem a data de encerramento, mais recente primeiro.
 */
const POR_ENCERRAMENTO: OrdemDaColuna = {
  sort: 'concluidaEm',
  dir: 'desc',
  texto: 'encerradas mais recentes primeiro',
};

const ORDEM_DO_QUADRO: Partial<Record<StatusSolicitacao, OrdemDaColuna>> = {
  A_FAZER: { sort: 'criadaEm', dir: 'desc', texto: 'mais recentes primeiro' },
  EM_ANDAMENTO: POR_PRAZO,
  EM_VALIDACAO: POR_PRAZO,
  CONCLUIDA: POR_ENCERRAMENTO,
  CANCELADA: POR_ENCERRAMENTO,
};

export function ordemDaColuna(status: StatusSolicitacao): OrdemDaColuna | undefined {
  return ORDEM_DO_QUADRO[status];
}
