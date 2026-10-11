import { Ticket, Wrench } from 'lucide-react';
import type { ReactNode } from 'react';

import { historicoDoModelo } from '@/features/admin/modelos/lib/historicoDoModelo';
import type { ItemDoHistoricoDoModelo } from '@/features/admin/modelos/lib/historicoDoModelo';
import type { EventoModelo } from '@/features/admin/modelos/types/modeloTypes';
import { SolicitacaoStatusBadge } from '@/features/solicitacoes/components/SolicitacaoStatusBadge';
import type { Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { LinhaDoTempo } from '@/shared/components/LinhaDoTempo/LinhaDoTempo';
import type { ItemDaLinhaDoTempo } from '@/shared/components/LinhaDoTempo/LinhaDoTempo';

type Props = {
  eventos: EventoModelo[];
  solicitacoes: Solicitacao[];
  totalDeSolicitacoes?: number;
};

function marcadorDoItem(item: ItemDoHistoricoDoModelo): ReactNode {
  if (item.tipo === 'SOLICITACAO') return <Ticket size={12} className="text-accent" aria-hidden />;
  return <Wrench size={12} className="text-fg-muted" aria-hidden />;
}

function tituloDoItem(item: ItemDoHistoricoDoModelo): ReactNode {
  if (!item.statusDaSolicitacao) return item.titulo;
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {item.titulo}
      <SolicitacaoStatusBadge status={item.statusDaSolicitacao} />
    </span>
  );
}

function detalheDoItem(item: ItemDoHistoricoDoModelo): ReactNode {
  if (!item.detalhe && !item.complemento) return null;
  return (
    <>
      {item.detalhe && <p className="text-sm text-fg">{item.detalhe}</p>}
      {item.complemento && <p className="text-xs text-fg-muted">{item.complemento}</p>}
    </>
  );
}

function paraItemDaLinhaDoTempo(item: ItemDoHistoricoDoModelo): ItemDaLinhaDoTempo {
  return {
    id: item.id,
    em: item.em,
    marcador: marcadorDoItem(item),
    titulo: tituloDoItem(item),
    detalhe: detalheDoItem(item),
    destino: item.destino,
    peso: 'destaque',
  };
}

export function HistoricoDoModelo({ eventos, solicitacoes, totalDeSolicitacoes }: Props) {
  const itens: ItemDaLinhaDoTempo[] = historicoDoModelo(eventos, solicitacoes).map(
    paraItemDaLinhaDoTempo,
  );
  const limitado: boolean = (totalDeSolicitacoes ?? 0) > solicitacoes.length;
  return (
    <div className="flex flex-col gap-3">
      {limitado && (
        <p className="text-xs text-fg-muted">
          Mostrando {solicitacoes.length} de {totalDeSolicitacoes} solicitações.
        </p>
      )}
      <LinhaDoTempo
        itens={itens}
        rotulo="Histórico do modelo"
        vazio={
          <EmptyState
            title="Nenhum evento registrado"
            description="O modelo ainda não possui eventos nem solicitações."
          />
        }
      />
    </div>
  );
}
