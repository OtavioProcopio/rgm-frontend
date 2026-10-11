import { rotuloDaPrioridade } from '@/shared/lib/rotulos';

import type { PrioridadeSolicitacao } from '../types/solicitacaoTypes';

/** Prazo de cada prioridade, igual ao do backend (4 h, 24 h, 72 h e 168 h). Fonte única do front. */
const PRAZO_EM_HORAS: Record<PrioridadeSolicitacao, number> = {
  URGENTE: 4,
  ALTA: 24,
  MEDIA: 72,
  BAIXA: 168,
};

const PRIORIDADES_DA_MAIS_PARA_A_MENOS_URGENTE: PrioridadeSolicitacao[] = [
  'URGENTE',
  'ALTA',
  'MEDIA',
  'BAIXA',
];

/** "4 h" até 24 h; "3 dias" ou "7 dias" a partir de 48 h. */
export function prazoEmTexto(prioridade: PrioridadeSolicitacao): string {
  const horas = PRAZO_EM_HORAS[prioridade];
  return horas <= 24 ? `${horas} h` : `${horas / 24} dias`;
}

/** Opções da triagem, da mais urgente para a menos, cada uma com o prazo que implica. */
export function opcoesDePrioridadeComPrazo(): { valor: PrioridadeSolicitacao; rotulo: string }[] {
  return PRIORIDADES_DA_MAIS_PARA_A_MENOS_URGENTE.map((valor) => ({
    valor,
    rotulo: `${rotuloDaPrioridade[valor]} · ${prazoEmTexto(valor)}`,
  }));
}
