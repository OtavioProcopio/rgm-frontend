import { Inbox } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

import type { Solicitacao, StatusSolicitacao } from '../types/solicitacaoTypes';
import { KanbanCard } from './KanbanCard';

export type ColumnConfig = {
  status: StatusSolicitacao;
  label: string;
  headerClass: string;
  accentClass: string;
};

type Props = {
  config: ColumnConfig;
  cards: Solicitacao[];
  isDropTarget: boolean;
  isInvalidDrop: boolean;
  mobileView?: boolean;
  canDragCard: (s: Solicitacao) => boolean;
  canAdvanceCard: (s: Solicitacao) => boolean;
  onDragStart: (s: Solicitacao) => void;
  onDragOver: (status: StatusSolicitacao) => void;
  onDrop: (status: StatusSolicitacao) => void;
  onAdvance: (s: Solicitacao) => void;
};

export function KanbanColumn({
  config,
  cards,
  isDropTarget,
  isInvalidDrop,
  mobileView = false,
  canDragCard,
  canAdvanceCard,
  onDragStart,
  onDragOver,
  onDrop,
  onAdvance,
}: Props) {
  return (
    <div className={cn('flex flex-col', mobileView ? 'w-full' : 'w-72 shrink-0')}>
      {/* Header — only shown in desktop (mobile shows tabs instead) */}
      {!mobileView && (
        <div
          className={cn(
            'flex items-center justify-between rounded-t-lg px-3 py-2.5',
            config.headerClass,
          )}
        >
          <span className="text-sm font-semibold tracking-wide">{config.label}</span>
          <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold tabular-nums">
            {cards.length}
          </span>
        </div>
      )}

      {/* Drop zone */}
      <div
        className={cn(
          'flex-1 space-y-2 overflow-y-auto p-2 transition-colors',
          mobileView ? 'rounded-lg border-2' : 'rounded-b-lg border-2',
          isDropTarget && !isInvalidDrop
            ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/20'
            : isDropTarget && isInvalidDrop
              ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/20'
              : cn('border-transparent', config.accentClass),
        )}
        style={{
          minHeight: mobileView ? 300 : 200,
          maxHeight: mobileView ? 'none' : 'calc(100vh - 260px)',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(config.status);
        }}
        onDrop={(e) => {
          e.preventDefault();
          onDrop(config.status);
        }}
      >
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
              <Inbox size={16} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-600">Nenhuma solicitação</p>
          </div>
        ) : (
          cards.map((s) => (
            <KanbanCard
              key={s.id}
              solicitacao={s}
              isDraggable={canDragCard(s)}
              canAdvance={canAdvanceCard(s)}
              onDragStart={onDragStart}
              onAdvance={onAdvance}
            />
          ))
        )}
      </div>
    </div>
  );
}
