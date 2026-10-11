import { ArrowRight, MessageSquare, Paperclip, Plus, User } from 'lucide-react';
import type { ReactNode } from 'react';

import { LinhaDoTempo } from '@/shared/components/LinhaDoTempo/LinhaDoTempo';
import type { ItemDaLinhaDoTempo } from '@/shared/components/LinhaDoTempo/LinhaDoTempo';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { cn } from '@/shared/lib/cn';

import { historicoDaSolicitacao } from '../lib/historicoDaSolicitacao';
import type { ItemDoHistorico } from '../lib/historicoDaSolicitacao';
import type { AtividadeSolicitacao, TipoAtividadeSolicitacao } from '../types/solicitacaoTypes';
import { SolicitacaoStatusBadge } from './SolicitacaoStatusBadge';

type Props = {
  atividades: AtividadeSolicitacao[];
  isLoading?: boolean;
  formulario?: ReactNode;
};

/** Marcador de cada tipo de atividade; o texto vem de `rotuloDoTipoDeAtividade`. */
const TIPO_CONFIG: Record<
  TipoAtividadeSolicitacao,
  { iconClass: string; dotClass: string; Icon: React.ElementType }
> = {
  ABERTURA: { iconClass: 'text-info-fg', dotClass: 'bg-info-soft', Icon: Plus },
  ATRIBUICAO: { iconClass: 'text-accent', dotClass: 'bg-surface-muted', Icon: User },
  MUDANCA_STATUS: { iconClass: 'text-warning-fg', dotClass: 'bg-warning-soft', Icon: ArrowRight },
  COMENTARIO: { iconClass: 'text-success-fg', dotClass: 'bg-success-soft', Icon: MessageSquare },
  EVIDENCIA_ADICIONADA: {
    iconClass: 'text-fg-muted',
    dotClass: 'bg-surface-muted',
    Icon: Paperclip,
  },
};

function Marcador({ tipo }: { tipo: TipoAtividadeSolicitacao }) {
  const { Icon, dotClass, iconClass } = TIPO_CONFIG[tipo];
  return (
    <div className={cn('flex size-6 shrink-0 items-center justify-center rounded-full', dotClass)}>
      <Icon size={12} className={iconClass} />
    </div>
  );
}

function TituloDaMudanca({ de, para }: NonNullable<ItemDoHistorico['mudancaDeStatus']>) {
  return (
    <span>
      Status alterado: <SolicitacaoStatusBadge status={de} />{' '}
      <ArrowRight aria-hidden="true" size={12} className="inline" />{' '}
      <span className="sr-only">para</span> <SolicitacaoStatusBadge status={para} />
    </span>
  );
}

function tituloDe(item: ItemDoHistorico): ReactNode {
  if (item.tipo === 'MUDANCA_STATUS' && item.mudancaDeStatus) {
    return <TituloDaMudanca {...item.mudancaDeStatus} />;
  }
  return item.titulo;
}

function detalheDe(item: ItemDoHistorico): ReactNode {
  if (item.detalhe === null) return undefined;
  if (item.tipo === 'COMENTARIO') {
    return <p className="rounded-md bg-surface-muted px-3 py-2 text-sm text-fg">{item.detalhe}</p>;
  }
  return <p className="text-sm text-fg-muted">{item.detalhe}</p>;
}

function itemDaLinhaDoTempo(item: ItemDoHistorico): ItemDaLinhaDoTempo {
  return {
    id: item.id,
    em: item.em,
    marcador: <Marcador tipo={item.tipo} />,
    titulo: tituloDe(item),
    detalhe: detalheDe(item),
    autor: item.autor,
    peso: item.peso,
  };
}

export function SolicitacaoTimeline({ atividades, isLoading, formulario }: Props) {
  if (isLoading) return <LoadingState title="Carregando histórico..." />;

  const itens: ItemDaLinhaDoTempo[] = historicoDaSolicitacao(atividades).map(itemDaLinhaDoTempo);

  return (
    <div className="space-y-4">
      {formulario}
      <LinhaDoTempo
        itens={itens}
        rotulo="Histórico de atividades"
        vazio={<p className="text-sm text-fg-muted">Nenhuma atividade registrada.</p>}
      />
    </div>
  );
}
