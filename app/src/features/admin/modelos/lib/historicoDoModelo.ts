import type { EventoModelo } from '@/features/admin/modelos/types/modeloTypes';
import type {
  Solicitacao,
  StatusSolicitacao,
} from '@/features/solicitacoes/types/solicitacaoTypes';

export type ItemDoHistoricoDoModelo = {
  id: string;
  em: string;
  tipo: 'EVENTO' | 'SOLICITACAO';
  titulo: string;
  detalhe: string | null;
  complemento: string | null;
  statusDaSolicitacao: StatusSolicitacao | null;
  destino: string | null;
};

function destinoDaSolicitacao(id: string | null): string | null {
  return id ? `/app/solicitacoes/${id}` : null;
}

function itemDoEvento(evento: EventoModelo): ItemDoHistoricoDoModelo {
  return {
    id: evento.id,
    em: evento.criadoEm,
    tipo: 'EVENTO',
    titulo: evento.titulo,
    detalhe: evento.descricao ?? evento.tipo,
    complemento: evento.estadoModeloDescricao,
    statusDaSolicitacao: null,
    destino: destinoDaSolicitacao(evento.solicitacaoRelacionadaId),
  };
}

function itemDaSolicitacao(solicitacao: Solicitacao): ItemDoHistoricoDoModelo {
  return {
    id: `solicitacao-${solicitacao.id}`,
    em: solicitacao.criadaEm,
    tipo: 'SOLICITACAO',
    titulo: solicitacao.titulo,
    detalhe: null,
    complemento: null,
    statusDaSolicitacao: solicitacao.status,
    destino: destinoDaSolicitacao(solicitacao.id),
  };
}

export function historicoDoModelo(
  eventos: readonly EventoModelo[],
  solicitacoes: readonly Solicitacao[],
): ItemDoHistoricoDoModelo[] {
  const cobertas = new Set<string>();
  eventos.forEach((evento) => {
    if (evento.solicitacaoRelacionadaId) cobertas.add(evento.solicitacaoRelacionadaId);
  });
  const naoCobertas = solicitacoes.filter((solicitacao) => !cobertas.has(solicitacao.id));
  return [...eventos.map(itemDoEvento), ...naoCobertas.map(itemDaSolicitacao)];
}
