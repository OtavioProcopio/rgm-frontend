import { useState } from 'react';

import { useAuth } from '@/app/providers/authContext';
import { Dialog } from '@/shared/components/Dialog/Dialog';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { cn } from '@/shared/lib/cn';

import { AcaoSolicitacaoAtiva } from '../actions/AcaoSolicitacaoAtiva';
import { useAcoesPermitidas } from '../hooks/useAcoesPermitidas';
import { useKanbanSolicitacoes } from '../hooks/useKanbanSolicitacoes';
import {
  acaoDoMovimento,
  proximoStatus,
  rotuloDaAcao,
  type AcaoSolicitacao,
} from '../lib/acoesSolicitacao';
import { getSolicitacaoErrorMessage } from '../lib/solicitacaoMessages';
import type { Solicitacao, StatusSolicitacao } from '../types/solicitacaoTypes';
import { COLUMNS, TAB_ACCENT } from './kanbanColunas';
import { KanbanColumn } from './KanbanColumn';

type AcaoPendente = { acao: AcaoSolicitacao; card: Solicitacao };

type Props = { modeloId?: string; dataInicio?: string; dataFim?: string };

export function KanbanBoard({ modeloId, dataInicio, dataFim }: Props) {
  const { user } = useAuth();
  const isOperador = user?.perfil === 'OPERADOR';
  const acoesDe = useAcoesPermitidas();

  const { data: solicitacoes = [], isLoading, error } = useKanbanSolicitacoes(modeloId, {
    dataInicio,
    dataFim,
  });

  const [dragging, setDragging] = useState<Solicitacao | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<StatusSolicitacao | null>(null);
  const [acaoPendente, setAcaoPendente] = useState<AcaoPendente | null>(null);
  const [activeTab, setActiveTab] = useState<StatusSolicitacao>('A_FAZER');

  /** Ação que o movimento representa, se o usuário pode executá-la sobre o card. */
  function acaoPermitidaDoMovimento(card: Solicitacao, para: StatusSolicitacao) {
    const acao = acaoDoMovimento(card.status, para);
    return acao && acoesDe(card).has(acao) ? acao : null;
  }

  function canDragCard(card: Solicitacao): boolean {
    return COLUMNS.some((col) => acaoPermitidaDoMovimento(card, col.status) !== null);
  }

  function tryMove(card: Solicitacao, para: StatusSolicitacao) {
    const acao = acaoPermitidaDoMovimento(card, para);
    if (acao) setAcaoPendente({ acao, card });
  }

  function handleDrop(toStatus: StatusSolicitacao) {
    if (dragging) tryMove(dragging, toStatus);
    setDragging(null);
    setDragOverStatus(null);
  }

  function canAdvanceCard(card: Solicitacao): boolean {
    const proximo = proximoStatus(card.status);
    return proximo !== null && acaoPermitidaDoMovimento(card, proximo) !== null;
  }

  function handleAdvance(card: Solicitacao) {
    const proximo = proximoStatus(card.status);
    if (proximo) tryMove(card, proximo);
  }

  if (isLoading) return <LoadingState title="Carregando quadro..." />;
  if (error)
    return (
      <ErrorState
        title="Erro ao carregar solicitações"
        description={getSolicitacaoErrorMessage(error)}
      />
    );
  if (isOperador && solicitacoes.length === 0) {
    return (
      <EmptyState
        title="Nenhuma solicitação atribuída a você"
        description="Assim que uma solicitação for atribuída a você, ela aparecerá aqui."
      />
    );
  }

  const cardsByStatus = Object.fromEntries(
    COLUMNS.map((col) => [col.status, solicitacoes.filter((s) => s.status === col.status)]),
  ) as Record<StatusSolicitacao, Solicitacao[]>;

  const activeColumn = COLUMNS.find((c) => c.status === activeTab)!;

  return (
    <div
      className="relative"
      onDragEnd={() => {
        setDragging(null);
        setDragOverStatus(null);
      }}
    >
      {/* ── Mobile: tab bar ── */}
      <div className="mb-3 lg:hidden">
        <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          {COLUMNS.map((col) => {
            const count = cardsByStatus[col.status]?.length ?? 0;
            const isActive = col.status === activeTab;
            return (
              <button
                key={col.status}
                type="button"
                onClick={() => setActiveTab(col.status)}
                className={cn(
                  'flex shrink-0 flex-col items-center border-b-2 px-4 py-2.5 text-center transition-colors',
                  isActive
                    ? cn('border-b-2', TAB_ACCENT[col.status])
                    : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
                )}
              >
                <span
                  className={cn(
                    'text-lg font-bold tabular-nums leading-none',
                    isActive ? '' : 'text-slate-700 dark:text-slate-200',
                  )}
                >
                  {count}
                </span>
                <span className="mt-0.5 whitespace-nowrap text-xs font-medium">{col.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile single column */}
        <div className="mt-2">
          <KanbanColumn
            config={activeColumn}
            cards={cardsByStatus[activeTab] ?? []}
            isDropTarget={false}
            isInvalidDrop={false}
            mobileView
            canDragCard={canDragCard}
            canAdvanceCard={canAdvanceCard}
            onDragStart={setDragging}
            onDragOver={setDragOverStatus}
            onDrop={handleDrop}
            onAdvance={handleAdvance}
          />
        </div>
      </div>

      {/* ── Desktop: horizontal board ── */}
      <div className="hidden gap-4 overflow-x-auto pb-4 lg:flex">
        {COLUMNS.map((col) => {
          const isDropTarget = dragOverStatus === col.status;
          const isInvalidDrop =
            isDropTarget && !!dragging && acaoPermitidaDoMovimento(dragging, col.status) === null;
          return (
            <KanbanColumn
              key={col.status}
              config={col}
              cards={cardsByStatus[col.status] ?? []}
              isDropTarget={isDropTarget}
              isInvalidDrop={isInvalidDrop}
              canDragCard={canDragCard}
              canAdvanceCard={canAdvanceCard}
              onDragStart={setDragging}
              onDragOver={setDragOverStatus}
              onDrop={handleDrop}
              onAdvance={handleAdvance}
            />
          );
        })}
      </div>

      {/* ── Diálogo da ação ── */}
      {acaoPendente && (
        <Dialog
          titulo={`${rotuloDaAcao(acaoPendente.acao)}: ${acaoPendente.card.titulo}`}
          onClose={() => setAcaoPendente(null)}
        >
          <AcaoSolicitacaoAtiva
            acao={acaoPendente.acao}
            solicitacao={acaoPendente.card}
            onClose={() => setAcaoPendente(null)}
          />
        </Dialog>
      )}
    </div>
  );
}
