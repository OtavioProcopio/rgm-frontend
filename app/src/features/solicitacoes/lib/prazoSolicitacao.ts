import { DIA_MS, formatarDuracao } from '@/shared/lib/duracao';

import type { Solicitacao } from '../types/solicitacaoTypes';

export type TomDoPrazo = 'neutro' | 'atencao' | 'atraso' | 'ok';

export type SituacaoDoPrazo = { tom: TomDoPrazo; rotulo: string };

/** Prazo ausente, malformado ou de solicitação cancelada: não há o que mostrar. */
function semPrazoParaMostrar(solicitacao: Solicitacao): boolean {
  const { status, prazoLimite } = solicitacao;
  if (status === 'CANCELADA' || !prazoLimite) return true;
  return Number.isNaN(Date.parse(prazoLimite));
}

function prazoDaConcluida(atrasada: boolean | undefined): SituacaoDoPrazo {
  return atrasada ? { tom: 'atraso', rotulo: 'Fora do prazo' } : { tom: 'ok', rotulo: 'No prazo' };
}

function atrasadaHa(restanteMs: number): SituacaoDoPrazo {
  return { tom: 'atraso', rotulo: `Atrasada há ${formatarDuracao(-restanteMs)}` };
}

function venceEm(restanteMs: number, totalMs: number): SituacaoDoPrazo {
  return {
    tom: restanteMs <= totalMs / 4 ? 'atencao' : 'neutro',
    rotulo: `Vence em ${formatarDuracao(restanteMs)}`,
  };
}

/**
 * O que o card diz sobre o prazo de SLA, só com o que a API informa (`prazoLimite` e
 * `atrasada`). Sem esses dados não há selo: o prazo não é recalculado na tela.
 */
export function situacaoDoPrazo(solicitacao: Solicitacao, agoraMs: number): SituacaoDoPrazo | null {
  if (semPrazoParaMostrar(solicitacao)) return null;
  if (solicitacao.status === 'CONCLUIDA') return prazoDaConcluida(solicitacao.atrasada);

  const prazoMs = Date.parse(solicitacao.prazoLimite as string);
  const restanteMs = prazoMs - agoraMs;
  if (restanteMs <= 0) return atrasadaHa(restanteMs);
  if (solicitacao.atrasada) return { tom: 'atraso', rotulo: 'Atrasada' };

  const totalMs = prazoMs - Date.parse(solicitacao.criadaEm);
  if (restanteMs > totalMs / 2) return null;
  return venceEm(restanteMs, totalMs);
}

/**
 * O prazo no resumo da solicitação: diferente do card, aparece sempre que a API informa
 * `prazoLimite`, mesmo com muito prazo restante.
 */
export function prazoDoResumo(solicitacao: Solicitacao, agoraMs: number): SituacaoDoPrazo | null {
  if (semPrazoParaMostrar(solicitacao)) return null;
  if (solicitacao.status === 'CONCLUIDA') return prazoDaConcluida(solicitacao.atrasada);

  const prazoMs = Date.parse(solicitacao.prazoLimite as string);
  const restanteMs = prazoMs - agoraMs;
  if (restanteMs <= 0) return atrasadaHa(restanteMs);
  if (solicitacao.atrasada) return { tom: 'atraso', rotulo: 'Atrasada' };

  return venceEm(restanteMs, prazoMs - Date.parse(solicitacao.criadaEm));
}

/** Dias inteiros desde a abertura; nulo em solicitação encerrada, que não envelhece mais. */
export function idadeEmDias(solicitacao: Solicitacao, agoraMs: number): number | null {
  if (solicitacao.status === 'CONCLUIDA' || solicitacao.status === 'CANCELADA') return null;
  return Math.floor((agoraMs - Date.parse(solicitacao.criadaEm)) / DIA_MS);
}
