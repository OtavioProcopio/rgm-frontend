import { rotuloDoStatus } from '@/shared/lib/rotulos';

import type { Solicitacao } from '../types/solicitacaoTypes';
import { situacaoDoPrazo } from './prazoSolicitacao';

export const LIMITE_DA_FILA = 5;
export const LIMITE_DA_CONSULTA = 100;

export type ItemDaFila = {
  id: string;
  titulo: string;
  /** O código do modelo não vem da listagem (só em criação): o componente busca o modelo. */
  modeloId: string | null;
  responsaveis: string;
  etapa: string;
  atraso: string | null;
  href: string;
};

/** Prazo em ms; ausente ou inválido vira infinito para ir ao fim da fila. */
function prazoEmMs(solicitacao: Solicitacao): number {
  const prazoMs = Date.parse(solicitacao.prazoLimite ?? '');
  return Number.isNaN(prazoMs) ? Number.POSITIVE_INFINITY : prazoMs;
}

function compararPrazos(a: Solicitacao, b: Solicitacao): number {
  const prazoA = prazoEmMs(a);
  const prazoB = prazoEmMs(b);
  if (prazoA === prazoB) return 0;
  return prazoA < prazoB ? -1 : 1;
}

/** Mais atrasada primeiro; sem prazo válido ao fim. Estável e sem mutar a entrada. */
export function ordenarPorAtraso(solicitacoes: Solicitacao[]): Solicitacao[] {
  return [...solicitacoes].sort(compararPrazos);
}

/** Nomes quando a API os traz; senão só a contagem, nunca o identificador. */
export function responsaveisEmTexto(solicitacao: Solicitacao): string {
  const nomes = (solicitacao.responsaveis ?? []).map((responsavel) => responsavel.nome);
  if (nomes.length > 0) return nomes.join(', ');

  const total = solicitacao.responsavelIds.length;
  if (total === 0) return 'Sem responsável';
  return total === 1 ? '1 responsável' : `${total} responsáveis`;
}

function paraItem(solicitacao: Solicitacao, agoraMs: number): ItemDaFila {
  return {
    id: solicitacao.id,
    titulo: solicitacao.titulo,
    modeloId: solicitacao.modeloId ?? null,
    responsaveis: responsaveisEmTexto(solicitacao),
    etapa: rotuloDoStatus[solicitacao.status],
    atraso: situacaoDoPrazo(solicitacao, agoraMs)?.rotulo ?? null,
    href: `/app/solicitacoes/${solicitacao.id}`,
  };
}

export function itensDaFila(solicitacoes: Solicitacao[], agoraMs: number): ItemDaFila[] {
  return ordenarPorAtraso(solicitacoes)
    .slice(0, LIMITE_DA_FILA)
    .map((solicitacao) => paraItem(solicitacao, agoraMs));
}
