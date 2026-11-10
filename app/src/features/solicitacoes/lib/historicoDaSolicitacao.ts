import type {
  AtividadeSolicitacao,
  StatusSolicitacao,
  TipoAtividadeSolicitacao,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import { isoValido } from '@/shared/lib/data';
import { ROTULO_DE_ATIVIDADE_DESCONHECIDA, rotuloDoTipoDeAtividade } from '@/shared/lib/rotulos';

export type PesoDoItem = 'destaque' | 'discreto';

export type ItemDoHistorico = {
  id: string;
  em: string;
  tipo: TipoAtividadeSolicitacao;
  titulo: string;
  detalhe: string | null;
  autor: { nome: string; iniciais: string };
  peso: PesoDoItem;
  mudancaDeStatus: { de: StatusSolicitacao; para: StatusSolicitacao } | null;
};

const PESO_POR_TIPO: Record<TipoAtividadeSolicitacao, PesoDoItem> = {
  ABERTURA: 'destaque',
  COMENTARIO: 'destaque',
  EVIDENCIA_ADICIONADA: 'destaque',
  INSTRUCAO_ALTERADA: 'destaque',
  ATRIBUICAO: 'discreto',
  MUDANCA_STATUS: 'discreto',
};

export function iniciaisDe(nome: string): string {
  const palavras: string[] = nome
    .split(/\s+/)
    .filter((palavra: string): boolean => /^\p{L}/u.test(palavra));
  if (palavras.length === 0) return '?';
  const primeira: string = palavras[0].charAt(0);
  const ultima: string = palavras.length > 1 ? palavras[palavras.length - 1].charAt(0) : '';
  return (primeira + ultima).toUpperCase();
}

function mudancaDeStatusDe(atividade: AtividadeSolicitacao): ItemDoHistorico['mudancaDeStatus'] {
  const { tipo, deStatus, paraStatus } = atividade;
  if (tipo !== 'MUDANCA_STATUS' || deStatus === null || paraStatus === null) return null;
  return { de: deStatus, para: paraStatus };
}

/** Na correção da instrução, o texto da atividade é o que estava escrito antes. */
function detalheDe(atividade: AtividadeSolicitacao): string | null {
  if (atividade.comentario === null || atividade.comentario === undefined) return null;
  return atividade.tipo === 'INSTRUCAO_ALTERADA'
    ? `Antes: ${atividade.comentario}`
    : atividade.comentario;
}

/**
 * Um tipo que o backend criou depois deste front não derruba a linha do tempo: aparece como
 * "Atividade registrada", em tom discreto.
 */
function itemDe(atividade: AtividadeSolicitacao): ItemDoHistorico {
  const rotulos: Partial<Record<string, string>> = rotuloDoTipoDeAtividade;
  const pesos: Partial<Record<string, PesoDoItem>> = PESO_POR_TIPO;
  return {
    id: atividade.id,
    em: atividade.criadaEm,
    tipo: atividade.tipo,
    titulo: rotulos[atividade.tipo] ?? ROTULO_DE_ATIVIDADE_DESCONHECIDA,
    detalhe: detalheDe(atividade),
    autor: { nome: atividade.autorNome, iniciais: iniciaisDe(atividade.autorNome) },
    peso: pesos[atividade.tipo] ?? 'discreto',
    mudancaDeStatus: mudancaDeStatusDe(atividade),
  };
}

export function historicoDaSolicitacao(
  atividades: readonly AtividadeSolicitacao[],
): ItemDoHistorico[] {
  return atividades.filter((atividade) => isoValido(atividade.criadaEm)).map(itemDe);
}
