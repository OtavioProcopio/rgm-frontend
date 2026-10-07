import { Inbox } from 'lucide-react';

import { Button } from '@/shared/components/Button/Button';

import { cn } from '@/shared/lib/cn';

import type { RelacaoDoOperador } from '../lib/relacaoDoOperador';
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
  /** Total de solicitações do status; pode ser maior que a quantidade de cards carregados. */
  total: number;
  temMais?: boolean;
  carregandoMais?: boolean;
  falhouAoCarregarMais?: boolean;
  onCarregarMais?: () => void;
  /** Recorte aplicado à coluna, dito ao usuário (por exemplo "Últimos 30 dias"). */
  aviso?: string;
  isDropTarget: boolean;
  isInvalidDrop: boolean;
  mobileView?: boolean;
  canDragCard: (s: Solicitacao) => boolean;
  canAdvanceCard: (s: Solicitacao) => boolean;
  /** Relação do operador com cada card; ausente para quem vê todas as solicitações. */
  relacaoDe?: (s: Solicitacao) => RelacaoDoOperador | null;
  onDragStart: (s: Solicitacao) => void;
  onDragOver: (status: StatusSolicitacao) => void;
  onDrop: (status: StatusSolicitacao) => void;
  onAdvance: (s: Solicitacao) => void;
};

export function KanbanColumn({
  config,
  cards,
  total,
  temMais = false,
  carregandoMais = false,
  falhouAoCarregarMais = false,
  onCarregarMais,
  aviso,
  isDropTarget,
  isInvalidDrop,
  mobileView = false,
  canDragCard,
  canAdvanceCard,
  relacaoDe,
  onDragStart,
  onDragOver,
  onDrop,
  onAdvance,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col',
        mobileView ? 'w-full' : 'min-w-[170px] max-w-[340px] flex-1',
      )}
    >
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
            {total}
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
        {aviso ? (
          <p className="px-1 text-xs font-medium text-slate-600 dark:text-slate-300">{aviso}</p>
        ) : null}
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
              relacao={relacaoDe?.(s)}
              onDragStart={onDragStart}
              onAdvance={onAdvance}
            />
          ))
        )}
        {falhouAoCarregarMais ? (
          <p role="alert" className="px-1 text-xs font-medium text-red-700 dark:text-red-300">
            Não foi possível carregar mais solicitações. Tente de novo.
          </p>
        ) : null}
        {temMais ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={carregandoMais}
            onClick={onCarregarMais}
          >
            {carregandoMais ? 'Carregando...' : `Carregar mais (${cards.length} de ${total})`}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
