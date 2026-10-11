import type { StatusSolicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';

/** Fundo dos cabeçalhos das colunas e das abas do celular: o mesmo nas cinco etapas. */
export const FUNDO_NEUTRO = 'bg-surface-muted';

/** Ponto de cor: decorativo, redondo; quem diz a etapa é o nome. */
export const SELETOR_DO_PONTO = 'span[aria-hidden="true"].rounded-full';

/** Papel do ponto de cor de cada etapa do quadro, na ordem das colunas. */
export const ETAPAS: { status: StatusSolicitacao; ponto: string }[] = [
  { status: 'A_FAZER', ponto: 'bg-fg-muted' },
  { status: 'EM_ANDAMENTO', ponto: 'bg-info' },
  { status: 'EM_VALIDACAO', ponto: 'bg-warning' },
  { status: 'CONCLUIDA', ponto: 'bg-success' },
  { status: 'CANCELADA', ponto: 'bg-danger' },
];

/** Classes de fundo que o elemento escreve, sem as de estado (`hover:`, `focus:`). */
export function fundosDe(elemento: Element | null): string[] {
  if (!elemento) return [];
  return elemento.className.split(' ').filter((classe) => classe.startsWith('bg-'));
}
