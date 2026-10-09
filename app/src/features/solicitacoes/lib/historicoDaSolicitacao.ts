import type {
  AtividadeSolicitacao,
  StatusSolicitacao,
  TipoAtividadeSolicitacao,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import { rotuloDoTipoDeAtividade } from '@/shared/lib/rotulos';

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

function itemDe(atividade: AtividadeSolicitacao): ItemDoHistorico {
  return {
    id: atividade.id,
    em: atividade.criadaEm,
    tipo: atividade.tipo,
    titulo: rotuloDoTipoDeAtividade[atividade.tipo],
    detalhe: atividade.comentario ?? null,
    autor: { nome: atividade.autorNome, iniciais: iniciaisDe(atividade.autorNome) },
    peso: PESO_POR_TIPO[atividade.tipo],
    mudancaDeStatus: mudancaDeStatusDe(atividade),
  };
}

export function historicoDaSolicitacao(
  atividades: readonly AtividadeSolicitacao[],
): ItemDoHistorico[] {
  return atividades.map(itemDe);
}
