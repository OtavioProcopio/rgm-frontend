import type { Solicitacao } from '../types/solicitacaoTypes';

export type TomDoPrazo = 'neutro' | 'atencao' | 'atraso' | 'ok';

export type SituacaoDoPrazo = { tom: TomDoPrazo; rotulo: string };

const MINUTO_MS = 60_000;
const HORA_MS = 60 * MINUTO_MS;
const DIA_MS = 24 * HORA_MS;

/** Minutos abaixo de 1 hora, horas abaixo de 48 horas, dias a partir daí. */
export function formatarDuracao(ms: number): string {
  if (ms < HORA_MS) return `${Math.max(1, Math.floor(ms / MINUTO_MS))} min`;
  if (ms < 2 * DIA_MS) return `${Math.floor(ms / HORA_MS)} h`;
  return `${Math.floor(ms / DIA_MS)} d`;
}

/**
 * O que o card diz sobre o prazo de SLA, só com o que a API informa (`prazoLimite` e
 * `atrasada`). Sem esses dados não há selo: o prazo não é recalculado na tela.
 */
export function situacaoDoPrazo(solicitacao: Solicitacao, agoraMs: number): SituacaoDoPrazo | null {
  const { status, prazoLimite, atrasada } = solicitacao;
  if (status === 'CANCELADA' || !prazoLimite) return null;

  if (status === 'CONCLUIDA') {
    return atrasada ? { tom: 'atraso', rotulo: 'Fora do prazo' } : { tom: 'ok', rotulo: 'No prazo' };
  }

  const prazoMs = Date.parse(prazoLimite);
  const restanteMs = prazoMs - agoraMs;
  if (restanteMs <= 0) {
    return { tom: 'atraso', rotulo: `Atrasada há ${formatarDuracao(-restanteMs)}` };
  }
  if (atrasada) return { tom: 'atraso', rotulo: 'Atrasada' };

  const totalMs = prazoMs - Date.parse(solicitacao.criadaEm);
  if (restanteMs > totalMs / 2) return null;
  return {
    tom: restanteMs <= totalMs / 4 ? 'atencao' : 'neutro',
    rotulo: `Vence em ${formatarDuracao(restanteMs)}`,
  };
}

/** Dias inteiros desde a abertura; nulo em solicitação encerrada, que não envelhece mais. */
export function idadeEmDias(solicitacao: Solicitacao, agoraMs: number): number | null {
  if (solicitacao.status === 'CONCLUIDA' || solicitacao.status === 'CANCELADA') return null;
  return Math.floor((agoraMs - Date.parse(solicitacao.criadaEm)) / DIA_MS);
}
