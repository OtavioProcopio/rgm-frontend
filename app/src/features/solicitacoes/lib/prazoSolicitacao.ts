import { formatarDuracao } from '@/shared/lib/duracao';

import type { Solicitacao } from '../types/solicitacaoTypes';

export { formatarDuracao } from '@/shared/lib/duracao';

export type TomDoPrazo = 'neutro' | 'atencao' | 'atraso' | 'ok';

export type SituacaoDoPrazo = { tom: TomDoPrazo; rotulo: string };

const DIA_MS = 24 * 60 * 60_000;

/**
 * O que o card diz sobre o prazo de SLA, só com o que a API informa (`prazoLimite` e
 * `atrasada`). Sem esses dados não há selo: o prazo não é recalculado na tela.
 */
export function situacaoDoPrazo(solicitacao: Solicitacao, agoraMs: number): SituacaoDoPrazo | null {
  const { status, prazoLimite, atrasada } = solicitacao;
  if (status === 'CANCELADA' || !prazoLimite) return null;

  if (status === 'CONCLUIDA') {
    return atrasada
      ? { tom: 'atraso', rotulo: 'Fora do prazo' }
      : { tom: 'ok', rotulo: 'No prazo' };
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

/**
 * O prazo no resumo da solicitação: diferente do card, aparece sempre que a API informa
 * `prazoLimite`, mesmo com muito prazo restante.
 */
export function prazoDoResumo(solicitacao: Solicitacao, agoraMs: number): SituacaoDoPrazo | null {
  const { status, prazoLimite, atrasada } = solicitacao;
  if (status === 'CANCELADA' || !prazoLimite) return null;
  if (status === 'CONCLUIDA') return prazoDaConcluida(atrasada);

  const prazoMs = Date.parse(prazoLimite);
  const restanteMs = prazoMs - agoraMs;
  if (restanteMs <= 0) {
    return { tom: 'atraso', rotulo: `Atrasada há ${formatarDuracao(-restanteMs)}` };
  }
  if (atrasada) return { tom: 'atraso', rotulo: 'Atrasada' };

  const totalMs = prazoMs - Date.parse(solicitacao.criadaEm);
  return {
    tom: restanteMs <= totalMs / 4 ? 'atencao' : 'neutro',
    rotulo: `Vence em ${formatarDuracao(restanteMs)}`,
  };
}

function prazoDaConcluida(atrasada: boolean): SituacaoDoPrazo {
  return atrasada ? { tom: 'atraso', rotulo: 'Fora do prazo' } : { tom: 'ok', rotulo: 'No prazo' };
}

/** Dias inteiros desde a abertura; nulo em solicitação encerrada, que não envelhece mais. */
export function idadeEmDias(solicitacao: Solicitacao, agoraMs: number): number | null {
  if (solicitacao.status === 'CONCLUIDA' || solicitacao.status === 'CANCELADA') return null;
  return Math.floor((agoraMs - Date.parse(solicitacao.criadaEm)) / DIA_MS);
}
