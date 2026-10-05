import type { Solicitacao } from '../types/solicitacaoTypes';

/** Corpo do evento `solicitacao`: a solicitação mudou. */
export type EventoSolicitacao = { tipo: string; solicitacao: Solicitacao };

/** Corpo do evento `solicitacao_atividade`: o histórico mudou (comentário, evidência). */
export type EventoAtividade = { tipo: string; solicitacaoId: string };

const TIPO_RESPONSAVEIS_ALTERADOS = 'responsaveis_alterados';

function lerObjeto(data: unknown): Record<string, unknown> | null {
  if (typeof data !== 'string') return null;
  try {
    const corpo: unknown = JSON.parse(data);
    return typeof corpo === 'object' && corpo !== null ? (corpo as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Nulo quando o corpo não é um evento de solicitação legível. */
export function lerEventoSolicitacao(data: unknown): EventoSolicitacao | null {
  const corpo = lerObjeto(data);
  const solicitacao = corpo?.solicitacao as Partial<Solicitacao> | null | undefined;
  if (typeof solicitacao?.id !== 'string' || typeof solicitacao.status !== 'string') return null;
  return { tipo: String(corpo?.tipo ?? ''), solicitacao: solicitacao as Solicitacao };
}

/** Nulo quando o corpo não é um aviso de atividade legível. */
export function lerEventoAtividade(data: unknown): EventoAtividade | null {
  const corpo = lerObjeto(data);
  if (typeof corpo?.solicitacaoId !== 'string') return null;
  return { tipo: String(corpo.tipo ?? ''), solicitacaoId: corpo.solicitacaoId };
}

/**
 * Solicitação a mostrar no detalhe assim que o evento chega. O evento só traz os
 * responsáveis quando o aviso é de troca de responsáveis, e nunca traz as ações
 * permitidas: os responsáveis que a tela já mostrava são mantidos e as ações ficam sem
 * informação da API, para valer a regra local até o detalhe ser consultado de novo.
 */
export function mesclarSolicitacaoDoEvento(atual: Solicitacao, evento: EventoSolicitacao): Solicitacao {
  const trouxeResponsaveis = evento.tipo === TIPO_RESPONSAVEIS_ALTERADOS;
  return {
    ...atual,
    ...evento.solicitacao,
    responsavelIds: trouxeResponsaveis
      ? (evento.solicitacao.responsavelIds ?? [])
      : atual.responsavelIds,
    acoesPermitidas: null,
  };
}
