import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { evidenciasApi } from '@/features/evidencias/api/evidenciasApi';
import { usuariosApi } from '@/features/admin/usuarios/api/usuariosApi';
import { useAuth } from '@/app/providers/authContext';
import { usePerfil } from '@/features/auth/hooks/usePerfil';
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
import { EnviarValidacaoModal } from './EnviarValidacaoModal';
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

const NEXT_STATUS: Partial<Record<StatusSolicitacao, StatusSolicitacao>> = {
  A_FAZER: 'EM_ANDAMENTO',
  EM_ANDAMENTO: 'EM_VALIDACAO',
  EM_VALIDACAO: 'CONCLUIDA',
};

type MoveType = 'triagem' | 'encerramento' | 'devolucao' | 'direct' | null;

function getMoveType(from: StatusSolicitacao, to: StatusSolicitacao): MoveType {
  if (from === to || from === 'CONCLUIDA' || from === 'CANCELADA') return null;
  if (from === 'A_FAZER' && to === 'EM_ANDAMENTO') return 'triagem';
  if (from === 'EM_ANDAMENTO' && to === 'EM_VALIDACAO') return 'direct';
  if (
    (from === 'A_FAZER' || from === 'EM_ANDAMENTO' || from === 'EM_VALIDACAO') &&
    to === 'CANCELADA'
  ) {
    return 'encerramento';
  }
  if (from === 'EM_VALIDACAO' && to === 'CONCLUIDA') return 'encerramento';
  if (from === 'EM_VALIDACAO' && to === 'EM_ANDAMENTO') return 'devolucao';
  return null;
}

type PendingMove =
  | { type: 'triagem'; card: Solicitacao }
  | { type: 'encerramento'; card: Solicitacao; podeConcluir: boolean }
  | { type: 'devolucao'; card: Solicitacao }
  | { type: 'enviarValidacao'; card: Solicitacao };

type Props = { modeloId?: string };

export function KanbanBoard({ modeloId }: Props) {
  const { user } = useAuth();
  const { data: profile } = usePerfil();
  const canManage = canManageSolicitacoes(user?.perfil);
  const canAdmin = canAccessAdmin(user?.perfil);
  const isOperador = user?.perfil === 'OPERADOR';

  function canDragCard(s: Solicitacao): boolean {
    if (s.status === 'CONCLUIDA' || s.status === 'CANCELADA') return false;
    if (canManage) return true;
    // OPERADOR só pode arrastar card EM_ANDAMENTO do qual é responsável
    return isOperador && s.status === 'EM_ANDAMENTO' && !!(profile?.id && s.responsavelIds.includes(profile.id));
  }

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

  function tryMove(card: Solicitacao, toStatus: StatusSolicitacao): boolean {
    if (!canDragCard(card)) return false;
    const moveType = getMoveType(card.status, toStatus);
    // OPERADOR só pode fazer o move 'direct' (EM_ANDAMENTO → EM_VALIDACAO)
    if (!moveType || (!canManage && moveType !== 'direct')) return false;
    if (moveType === 'direct') {
      setPendingMove({ type: 'enviarValidacao', card });
      return true;
    }
    if (moveType === 'triagem') setPendingMove({ type: 'triagem', card });
    else if (moveType === 'encerramento')
      setPendingMove({
        type: 'encerramento',
        card,
        podeConcluir: card.status === 'EM_VALIDACAO',
      });
    else if (moveType === 'devolucao') setPendingMove({ type: 'devolucao', card });
    return true;
  }

  function handleDrop(toStatus: StatusSolicitacao) {
    if (dragging) tryMove(dragging, toStatus);
    setDragging(null);
    setDragOverStatus(null);
  }

  function canAdvanceCard(s: Solicitacao): boolean {
    const next = NEXT_STATUS[s.status];
    if (!next) return false;
    if (!canDragCard(s)) return false;
    const moveType = getMoveType(s.status, next);
    return !!moveType && (canManage || moveType === 'direct');
  }

  function handleAdvance(s: Solicitacao) {
    const next = NEXT_STATUS[s.status];
    if (next) tryMove(s, next);
  }

  function clearPendingMove() {
    setPendingMove(null);
    setActionError(null);
  }

  async function handleTriar(data: TriarSolicitacaoRequest, foto: File | null, nota: string) {
    if (!pendingMove) return;
    setActionError(null);
    try {
      await actions.triar.mutateAsync({ id: pendingMove.card.id, ...data });
      if (foto) {
        try {
          await evidenciasApi.anexar(pendingMove.card.id, foto, {
            tipo: 'INSTRUCAO_SERVICO',
            descricao: nota || undefined,
          });
        } catch (uploadErr) {
          console.error('Erro ao anexar evidência de triagem:', uploadErr);
        }
      }
      setPendingMove(null);
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  async function handleEncerrar(data: EncerrarSolicitacaoRequest, foto: File | null) {
    if (!pendingMove) return;
    setActionError(null);
    try {
      if (data.concluir) {
        await actions.encerrar.mutateAsync({ id: pendingMove.card.id, ...data });
        if (foto) {
          try {
            await evidenciasApi.anexar(pendingMove.card.id, foto, {
              tipo: 'CONCLUSAO',
              descricao: data.comentario,
            });
          } catch (uploadErr) {
            console.error('Erro ao anexar evidência de conclusão:', uploadErr);
          }
        }
      } else {
        await actions.cancelar.mutateAsync({ id: pendingMove.card.id, motivo: data.comentario });
      }
      setPendingMove(null);
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  async function handleDevolver(data: DevolverSolicitacaoRequest, foto: File | null) {
    if (!pendingMove) return;
    setActionError(null);
    try {
      await actions.devolver.mutateAsync({ id: pendingMove.card.id, ...data });
      if (foto) {
        try {
          await evidenciasApi.anexar(pendingMove.card.id, foto, {
            tipo: 'DEVOLUCAO',
            descricao: data.motivo,
          });
        } catch (uploadErr) {
          console.error('Erro ao anexar evidência de devolução:', uploadErr);
        }
      }
      setPendingMove(null);
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  async function handleEnviarValidacao(data: { comentario: string }) {
    if (!pendingMove) return;
    setActionError(null);
    try {
      await actions.enviarValidacao.mutateAsync({ id: pendingMove.card.id, comentario: data.comentario });
      setPendingMove(null);
    } catch (err) {
      setActionError(getSolicitacaoErrorMessage(err));
    }
  }

  if (isLoading) return <LoadingState title="Carregando quadro..." />;
  if (error)
    return (
      <ErrorState
        title="Erro ao carregar solicitações"
        description={getSolicitacaoErrorMessage(error)}
      />
    );

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
          const moveType = dragging ? getMoveType(dragging.status, col.status) : null;
          const isInvalidDrop = isDropTarget && (!moveType || (!canManage && moveType !== 'direct'));
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
            {pendingMove.type === 'enviarValidacao' && (
              <EnviarValidacaoModal
                solicitacaoId={pendingMove.card.id}
                isPending={actions.enviarValidacao.isPending}
                onCancel={clearPendingMove}
                onConfirm={handleEnviarValidacao}
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
