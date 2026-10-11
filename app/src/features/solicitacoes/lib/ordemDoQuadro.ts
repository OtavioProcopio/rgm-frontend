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
 * Concluída e Cancelada ficam de fora: a API só ordena por criação, prazo e prioridade.
 */
const ORDEM_DO_QUADRO: Partial<Record<StatusSolicitacao, OrdemDaColuna>> = {
  A_FAZER: { sort: 'criadaEm', dir: 'desc', texto: 'mais recentes primeiro' },
  EM_ANDAMENTO: POR_PRAZO,
  EM_VALIDACAO: POR_PRAZO,
};

export function ordemDaColuna(status: StatusSolicitacao): OrdemDaColuna | undefined {
  return ORDEM_DO_QUADRO[status];
}
