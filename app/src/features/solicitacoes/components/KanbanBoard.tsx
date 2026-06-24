import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { usuariosApi } from '@/features/admin/usuarios/api/usuariosApi';
import { useAuth } from '@/app/providers/authContext';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { cn } from '@/shared/lib/cn';
import { canAccessAdmin, canManageSolicitacoes } from '@/shared/lib/permissions';

import { useKanbanActions } from '../hooks/useKanbanActions';
import { useKanbanSolicitacoes } from '../hooks/useKanbanSolicitacoes';
import { getSolicitacaoErrorMessage } from '../lib/solicitacaoMessages';
import type {
  DevolverSolicitacaoRequest,
  EncerrarSolicitacaoRequest,
  Solicitacao,
  StatusSolicitacao,
  TriarSolicitacaoRequest,
} from '../types/solicitacaoTypes';
import { DevolucaoModal } from './DevolucaoModal';
import { EncerramentoModal } from './EncerramentoModal';
import { KanbanColumn, type ColumnConfig } from './KanbanColumn';
import { TriagemModal } from './TriagemModal';

const COLUMNS: ColumnConfig[] = [
  {
    status: 'A_FAZER',
    label: 'A Fazer',
    headerClass: 'bg-slate-600 text-white',
    accentClass: 'bg-slate-50 dark:bg-slate-900/40',
  },
  {
    status: 'EM_ANDAMENTO',
    label: 'Em Andamento',
    headerClass: 'bg-sky-600 text-white',
    accentClass: 'bg-sky-50/60 dark:bg-sky-950/20',
  },
  {
    status: 'EM_VALIDACAO',
    label: 'Em Validação',
    headerClass: 'bg-amber-500 text-white',
    accentClass: 'bg-amber-50/60 dark:bg-amber-950/20',
  },
  {
    status: 'CONCLUIDA',
    label: 'Concluída',
    headerClass: 'bg-emerald-600 text-white',
    accentClass: 'bg-emerald-50/60 dark:bg-emerald-950/20',
  },
  {
    status: 'CANCELADA',
    label: 'Cancelada',
    headerClass: 'bg-red-600 text-white',
    accentClass: 'bg-red-50/60 dark:bg-red-950/20',
  },
];

const TAB_ACCENT: Record<StatusSolicitacao, string> = {
  A_FAZER: 'border-b-slate-600 text-slate-700 dark:text-slate-200',
  EM_ANDAMENTO: 'border-b-sky-600 text-sky-700 dark:text-sky-300',
  EM_VALIDACAO: 'border-b-amber-500 text-amber-700 dark:text-amber-300',
  CONCLUIDA: 'border-b-emerald-600 text-emerald-700 dark:text-emerald-300',
  CANCELADA: 'border-b-red-600 text-red-700 dark:text-red-300',
};

type MoveType = 'triagem' | 'encerramento' | 'devolucao' | 'direct' | null;

function getMoveType(from: StatusSolicitacao, to: StatusSolicitacao): MoveType {
  if (from === to || from === 'CONCLUIDA' || from === 'CANCELADA') return null;
  if (from === 'A_FAZER' && to === 'EM_ANDAMENTO') return 'triagem';
  if (from === 'EM_ANDAMENTO' && to === 'EM_VALIDACAO') return 'direct';
  if (from === 'EM_ANDAMENTO' && to === 'CANCELADA') return 'encerramento';
  if (from === 'EM_VALIDACAO' && (to === 'CONCLUIDA' || to === 'CANCELADA')) return 'encerramento';
  if (from === 'EM_VALIDACAO' && to === 'EM_ANDAMENTO') return 'devolucao';
  return null;
}

type PendingMove =
  | { type: 'triagem'; card: Solicitacao }
  | { type: 'encerramento'; card: Solicitacao; podeConcluir: boolean }
  | { type: 'devolucao'; card: Solicitacao };

type Props = { modeloId?: string };

export function KanbanBoard({ modeloId }: Props) {
  const { user } = useAuth();
  const canManage = canManageSolicitacoes(user?.perfil);
  const canAdmin = canAccessAdmin(user?.perfil);

  const { data: solicitacoes = [], isLoading, error } = useKanbanSolicitacoes(modeloId);
  const actions = useKanbanActions();

  const [dragging, setDragging] = useState<Solicitacao | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<StatusSolicitacao | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StatusSolicitacao>('A_FAZER');

  const { data: usuariosPage } = useQuery({
    queryKey: ['admin', 'usuarios', 'triagem'],
    queryFn: () => usuariosApi.listar({ page: 0, size: 100, ativo: true }),
    enabled: canAdmin,
    staleTime: 5 * 60 * 1000,
  });
  const responsaveisOpcoes = (usuariosPage?.content ?? []).filter(
    (u) => u.perfil === 'OPERADOR' || u.perfil === 'GESTOR',
  );

  function handleDrop(toStatus: StatusSolicitacao) {
    if (!dragging || !canManage) { setDragging(null); setDragOverStatus(null); return; }
    const moveType = getMoveType(dragging.status, toStatus);
    if (!moveType) { setDragging(null); setDragOverStatus(null); return; }
    if (moveType === 'direct') {
      actions.enviarValidacao.mutate(dragging.id);
      setDragging(null); setDragOverStatus(null);
      return;
    }
    if (moveType === 'triagem') setPendingMove({ type: 'triagem', card: dragging });
    else if (moveType === 'encerramento') setPendingMove({ type: 'encerramento', card: dragging, podeConcluir: dragging.status === 'EM_VALIDACAO' });
    else if (moveType === 'devolucao') setPendingMove({ type: 'devolucao', card: dragging });
    setDragging(null); setDragOverStatus(null);
  }

  function clearPendingMove() { setPendingMove(null); setActionError(null); }

  async function handleTriar(data: TriarSolicitacaoRequest) {
    if (!pendingMove) return;
    setActionError(null);
    try { await actions.triar.mutateAsync({ id: pendingMove.card.id, ...data }); setPendingMove(null); }
    catch (err) { setActionError(getSolicitacaoErrorMessage(err)); }
  }

  async function handleEncerrar(data: EncerrarSolicitacaoRequest) {
    if (!pendingMove) return;
    setActionError(null);
    try { await actions.encerrar.mutateAsync({ id: pendingMove.card.id, ...data }); setPendingMove(null); }
    catch (err) { setActionError(getSolicitacaoErrorMessage(err)); }
  }

  async function handleDevolver(data: DevolverSolicitacaoRequest) {
    if (!pendingMove) return;
    setActionError(null);
    try { await actions.devolver.mutateAsync({ id: pendingMove.card.id, ...data }); setPendingMove(null); }
    catch (err) { setActionError(getSolicitacaoErrorMessage(err)); }
  }

  if (isLoading) return <LoadingState title="Carregando quadro..." />;
  if (error) return <ErrorState title="Erro ao carregar solicitações" description={getSolicitacaoErrorMessage(error)} />;

  const cardsByStatus = Object.fromEntries(
    COLUMNS.map((col) => [col.status, solicitacoes.filter((s) => s.status === col.status)]),
  ) as Record<StatusSolicitacao, Solicitacao[]>;

  const activeColumn = COLUMNS.find((c) => c.status === activeTab)!;

  return (
    <div className="relative" onDragEnd={() => { setDragging(null); setDragOverStatus(null); }}>
      {actionError && !pendingMove && (
        <p className="mb-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {actionError}
        </p>
      )}

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
                  'flex min-w-0 flex-1 flex-col items-center border-b-2 px-2 py-2.5 text-center transition-colors',
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
                <span className="mt-0.5 truncate text-xs font-medium">{col.label}</span>
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
            onDragStart={setDragging}
            onDragOver={setDragOverStatus}
            onDrop={handleDrop}
          />
        </div>
      </div>

      {/* ── Desktop: horizontal board ── */}
      <div className="hidden gap-4 overflow-x-auto pb-4 lg:flex">
        {COLUMNS.map((col) => {
          const isDropTarget = dragOverStatus === col.status;
          const moveType = dragging ? getMoveType(dragging.status, col.status) : null;
          const isInvalidDrop = isDropTarget && !moveType;
          return (
            <KanbanColumn
              key={col.status}
              config={col}
              cards={cardsByStatus[col.status] ?? []}
              isDropTarget={isDropTarget}
              isInvalidDrop={isInvalidDrop}
              onDragStart={setDragging}
              onDragOver={setDragOverStatus}
              onDrop={handleDrop}
            />
          );
        })}
      </div>

      {/* ── Modal overlay ── */}
      {pendingMove && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl">
            {pendingMove.type === 'triagem' && (
              <TriagemModal
                isPending={actions.triar.isPending}
                usuarios={responsaveisOpcoes}
                onCancel={clearPendingMove}
                onConfirm={handleTriar}
              />
            )}
            {pendingMove.type === 'encerramento' && (
              <EncerramentoModal
                isPending={actions.encerrar.isPending}
                podeConcluir={pendingMove.podeConcluir}
                onCancel={clearPendingMove}
                onConfirm={handleEncerrar}
              />
            )}
            {pendingMove.type === 'devolucao' && (
              <DevolucaoModal
                isPending={actions.devolver.isPending}
                onCancel={clearPendingMove}
                onConfirm={handleDevolver}
              />
            )}
            {actionError && (
              <p className="mt-2 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
                {actionError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
