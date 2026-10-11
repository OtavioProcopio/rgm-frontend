import type { Solicitacao } from '../types/solicitacaoTypes';

const MAXIMO_VISIVEL = 3;

export type ResponsaveisDoCard = {
  /** Iniciais dos primeiros responsáveis, na ordem da API. */
  iniciais: string[];
  /** Quantos responsáveis não couberam nas iniciais. */
  restantes: number;
  /** Nomes por extenso, para dica e leitor de tela; vazio quando a API não os informou. */
  nomes: string;
};

/** Duas letras: a primeira do primeiro nome e a primeira do último ("Maria da Silva" → "MS"). */
export function iniciaisDoNome(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

/** Responsáveis do card: iniciais dos que a API nomeou e quantos ficaram de fora. */
export function responsaveisDoCard(
  solicitacao: Pick<Solicitacao, 'responsavelIds' | 'responsaveis'>,
): ResponsaveisDoCard {
  const nomeados = (solicitacao.responsaveis ?? []).filter((r) => r.nome);
  const total = Math.max(solicitacao.responsavelIds.length, nomeados.length);
  const visiveis = nomeados.slice(0, MAXIMO_VISIVEL);
  return {
    iniciais: visiveis.map((r) => iniciaisDoNome(r.nome)),
    restantes: total - visiveis.length,
    nomes: nomeados.map((r) => r.nome).join(', '),
  };
}
