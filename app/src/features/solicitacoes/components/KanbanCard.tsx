import { useState } from 'react';
import { ExternalLink, Eye, Settings2, Wrench } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

import type { Solicitacao, TipoSolicitacao } from '../types/solicitacaoTypes';
import { SolicitacaoPrioridadeBadge } from './SolicitacaoPrioridadeBadge';

type Props = {
  solicitacao: Solicitacao;
  isDraggable: boolean;
  onDragStart: (s: Solicitacao) => void;
};

const TIPO_CONFIG: Record<
  TipoSolicitacao,
  { label: string; cls: string; Icon: React.ElementType }
> = {
  REPARO: {
    label: 'Reparo',
    cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    Icon: Wrench,
  },
  INSPECAO: {
    label: 'Inspeção',
    cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    Icon: Eye,
  },
  REENGENHARIA: {
    label: 'Reengenharia',
    cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    Icon: Settings2,
  },
};

const PRIORITY_BORDER: Record<string, string> = {
  URGENTE: 'border-l-red-500',
  ALTA: 'border-l-orange-400',
  MEDIA: 'border-l-sky-400',
  BAIXA: 'border-l-slate-300 dark:border-l-slate-600',
};

const SLA_HOURS: Record<string, number> = {
  URGENTE: 4,
  ALTA: 24,
  MEDIA: 72,
  BAIXA: 168,
};

function SlaBadge({
  atualizadaEm,
  prioridade,
}: {
  atualizadaEm: string;
  prioridade: string | null;
}) {
  const [now] = useState(() => Date.now());
  if (!prioridade) return null;
  const slaHours = SLA_HOURS[prioridade];
  if (!slaHours) return null;
  const hoursElapsed = (now - new Date(atualizadaEm).getTime()) / 3_600_000;
  const pct = Math.min(hoursElapsed / slaHours, 1);
  if (pct < 0.5) return null;
  const isOver = pct >= 1;
  const isNear = pct >= 0.75;
  return (
    <span
      className={cn(
        'shrink-0 rounded px-1 py-0.5 text-xs font-semibold tabular-nums',
        isOver
          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
          : isNear
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
      )}
      title={
        isOver
          ? `SLA excedido (meta: ${slaHours}h)`
          : `${Math.round(pct * 100)}% do SLA (meta: ${slaHours}h)`
      }
    >
      {isOver ? '⚠ SLA' : `${Math.round(pct * 100)}%`}
    </span>
  );
}

function AgeBadge({ criadaEm }: { criadaEm: string }) {
  const [now] = useState(() => Date.now());
  const days = Math.floor((now - new Date(criadaEm).getTime()) / 86_400_000);
  if (days === 0) return null;
  return (
    <span
      className={cn(
        'shrink-0 text-xs font-semibold tabular-nums',
        days > 7
          ? 'text-red-600 dark:text-red-400'
          : days > 3
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-slate-400 dark:text-slate-500',
      )}
      title={`Aberta há ${days} dias`}
    >
      {days}d
    </span>
  );
}

export function KanbanCard({ solicitacao, isDraggable, onDragStart }: Props) {
  const tipo = TIPO_CONFIG[solicitacao.tipo];
  const { Icon } = tipo;
  const borderClass = solicitacao.prioridade
    ? PRIORITY_BORDER[solicitacao.prioridade]
    : 'border-l-slate-200 dark:border-l-slate-700';

  return (
    <div
      draggable={isDraggable}
      onDragStart={isDraggable ? (e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(solicitacao);
      } : undefined}
      className={cn(
        'group rounded-lg border border-slate-200 border-l-4 bg-white shadow-sm',
        'transition-all hover:shadow-md active:opacity-50',
        isDraggable && 'lg:cursor-grab lg:active:cursor-grabbing',
        'dark:border-slate-700 dark:bg-slate-800',
        borderClass,
      )}
    >
      <div className="p-3">
        {/* Tipo + age */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium',
              tipo.cls,
            )}
          >
            <Icon size={10} />
            {tipo.label}
          </span>
          <AgeBadge criadaEm={solicitacao.criadaEm} />
        </div>

        {/* Título */}
        <p className="mt-2 text-sm font-semibold leading-snug text-slate-900 line-clamp-2 dark:text-white">
          {solicitacao.titulo}
        </p>

        {/* Descrição */}
        {solicitacao.descricao && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {solicitacao.descricao}
          </p>
        )}

        {/* Rodapé: prioridade + SLA + link */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {solicitacao.prioridade ? (
              <SolicitacaoPrioridadeBadge prioridade={solicitacao.prioridade} />
            ) : (
              <span className="text-xs text-slate-300 dark:text-slate-600">Sem prioridade</span>
            )}
            <SlaBadge
              atualizadaEm={solicitacao.atualizadaEm}
              prioridade={solicitacao.prioridade}
            />
          </div>
          <a
            href={`/app/solicitacoes/${solicitacao.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex shrink-0 items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-sky-600 transition-colors hover:bg-sky-50 hover:text-sky-700 dark:bg-slate-700 dark:text-sky-400 dark:hover:bg-sky-900/30"
          >
            Ver
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}
