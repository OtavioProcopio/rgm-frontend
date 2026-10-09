import type { PerfilUsuario } from '@/features/auth/types/authTypes';

import type { Solicitacao, StatusSolicitacao } from '../types/solicitacaoTypes';

export const ACOES_SOLICITACAO = [
  'TRIAR',
  'ALTERAR_RESPONSAVEIS',
  'ENVIAR_VALIDACAO',
  'DEVOLVER',
  'ENCERRAR',
  'CANCELAR',
] as const;

export type AcaoSolicitacao = (typeof ACOES_SOLICITACAO)[number];

export type AtorSolicitacao = { id?: string | null; perfil?: PerfilUsuario | null };

type SolicitacaoAvaliada = Pick<
  Solicitacao,
  'status' | 'abertaPorUsuarioId' | 'responsavelIds' | 'acoesPermitidas'
>;

/**
 * Ações que o usuário pode executar. Vale o que a API informou; sem essa informação
 * (listagens, eventos, backend anterior à v1.6.0), vale a regra local.
 */
export function acoesPermitidas(
  solicitacao: SolicitacaoAvaliada,
  ator: AtorSolicitacao,
): ReadonlySet<AcaoSolicitacao> {
  const informadas = solicitacao.acoesPermitidas;
  if (Array.isArray(informadas)) {
    return new Set(ACOES_SOLICITACAO.filter((acao) => informadas.includes(acao)));
  }
  return regraLocal(solicitacao, ator);
}

function acoesDeQuemGerencia(status: StatusSolicitacao): AcaoSolicitacao[] {
  const acoes: AcaoSolicitacao[] = [
    status === 'A_FAZER' ? 'TRIAR' : 'ALTERAR_RESPONSAVEIS',
    'CANCELAR',
  ];
  if (status === 'EM_VALIDACAO') acoes.push('DEVOLVER', 'ENCERRAR');
  return acoes;
}

function operadorPodeCancelar(solicitacao: SolicitacaoAvaliada, ator: AtorSolicitacao): boolean {
  const abriu = !!ator.id && solicitacao.abertaPorUsuarioId === ator.id;
  const semResponsaveis = solicitacao.responsavelIds.length === 0;
  return ator.perfil === 'OPERADOR' && solicitacao.status === 'A_FAZER' && abriu && semResponsaveis;
}

function regraLocal(solicitacao: SolicitacaoAvaliada, ator: AtorSolicitacao): Set<AcaoSolicitacao> {
  const acoes = new Set<AcaoSolicitacao>();
  const { status } = solicitacao;
  if (status === 'CONCLUIDA' || status === 'CANCELADA') return acoes;

  const gerencia = ator.perfil === 'ADMINISTRADOR' || ator.perfil === 'GESTOR';
  const operador = ator.perfil === 'OPERADOR';
  const responsavel = !!ator.id && solicitacao.responsavelIds.includes(ator.id);

  if (gerencia) acoesDeQuemGerencia(status).forEach((acao) => acoes.add(acao));
  if (status === 'EM_ANDAMENTO' && (gerencia || (operador && responsavel))) {
    acoes.add('ENVIAR_VALIDACAO');
  }
  if (operadorPodeCancelar(solicitacao, ator)) acoes.add('CANCELAR');
  return acoes;
}

const PROXIMO_STATUS: Partial<Record<StatusSolicitacao, StatusSolicitacao>> = {
  A_FAZER: 'EM_ANDAMENTO',
  EM_ANDAMENTO: 'EM_VALIDACAO',
  EM_VALIDACAO: 'CONCLUIDA',
};

/** Coluna para onde o card vai ao ser avançado. */
export function proximoStatus(status: StatusSolicitacao): StatusSolicitacao | null {
  return PROXIMO_STATUS[status] ?? null;
}

/** Ação que mover um card de uma coluna para outra representa; nulo se o movimento não existe. */
export function acaoDoMovimento(
  de: StatusSolicitacao,
  para: StatusSolicitacao,
): AcaoSolicitacao | null {
  if (de === para || de === 'CONCLUIDA' || de === 'CANCELADA') return null;
  if (para === 'CANCELADA') return 'CANCELAR';
  if (de === 'A_FAZER' && para === 'EM_ANDAMENTO') return 'TRIAR';
  if (de === 'EM_ANDAMENTO' && para === 'EM_VALIDACAO') return 'ENVIAR_VALIDACAO';
  if (de === 'EM_VALIDACAO' && para === 'CONCLUIDA') return 'ENCERRAR';
  if (de === 'EM_VALIDACAO' && para === 'EM_ANDAMENTO') return 'DEVOLVER';
  return null;
}

export type BotaoDeAcao = {
  acao: AcaoSolicitacao;
  rotulo: string;
  variante: 'primary' | 'secondary';
};

const BOTOES: BotaoDeAcao[] = [
  { acao: 'TRIAR', rotulo: 'Triar', variante: 'primary' },
  { acao: 'ALTERAR_RESPONSAVEIS', rotulo: 'Alterar responsáveis', variante: 'secondary' },
  { acao: 'ENVIAR_VALIDACAO', rotulo: 'Enviar para validação', variante: 'primary' },
  { acao: 'DEVOLVER', rotulo: 'Devolver', variante: 'primary' },
  { acao: 'ENCERRAR', rotulo: 'Encerrar', variante: 'secondary' },
  { acao: 'CANCELAR', rotulo: 'Cancelar', variante: 'secondary' },
];

/**
 * Botões a oferecer, na ordem da tela. "Cancelar" some quando há "Encerrar": o formulário
 * de encerramento já oferece o cancelamento.
 */
export function botoesDeAcao(acoes: ReadonlySet<AcaoSolicitacao>): BotaoDeAcao[] {
  return BOTOES.filter(
    (botao) => acoes.has(botao.acao) && !(botao.acao === 'CANCELAR' && acoes.has('ENCERRAR')),
  );
}

export const PRINCIPAL_POR_STATUS: Partial<Record<StatusSolicitacao, AcaoSolicitacao>> = {
  A_FAZER: 'TRIAR',
  EM_ANDAMENTO: 'ENVIAR_VALIDACAO',
  EM_VALIDACAO: 'ENCERRAR',
};

export type AcoesSeparadas = { principal: AcaoSolicitacao | null; outras: AcaoSolicitacao[] };

/**
 * Separa a ação em destaque das demais. A principal é a da etapa; sem ela, só se destaca
 * a ação que for a única permitida. "Cancelar" some quando há "Encerrar" e fica sempre por último.
 */
export function separarAcoes(
  acoes: ReadonlySet<AcaoSolicitacao>,
  status: StatusSolicitacao,
): AcoesSeparadas {
  const ordenadas = botoesDeAcao(acoes).map((botao) => botao.acao);
  const daEtapa = PRINCIPAL_POR_STATUS[status];
  const principal = ordenadas.length === 1 ? ordenadas[0] : (daEtapa ?? null);
  if (principal === null || !ordenadas.includes(principal)) {
    return { principal: null, outras: ordenadas };
  }
  return { principal, outras: ordenadas.filter((acao) => acao !== principal) };
}

/** Nome da ação para a tela: rótulo de botão e nome do diálogo. */
export function rotuloDaAcao(acao: AcaoSolicitacao): string {
  return BOTOES.find((botao) => botao.acao === acao)!.rotulo;
}
