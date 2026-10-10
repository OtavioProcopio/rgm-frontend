import { useState } from 'react';
import { Link } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { usePerfil } from '@/features/auth/hooks/usePerfil';
import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { cn } from '@/shared/lib/cn';

import { DialogoDaAcao } from '../actions/DialogoDaAcao';
import { useAcoesPermitidas } from '../hooks/useAcoesPermitidas';
import { useColunasDoQuadro } from '../hooks/useColunaDoQuadro';
import { useTemSolicitacaoDoOperador } from '../hooks/useTemSolicitacaoDoOperador';
import { acaoDoMovimento, proximoStatus, type AcaoSolicitacao } from '../lib/acoesSolicitacao';
import { colunaLimitadaAos30Dias, inicioDosUltimos30Dias } from '../lib/filtrosDaColuna';
import { relacaoDoOperador } from '../lib/relacaoDoOperador';
import { getSolicitacaoErrorMessage } from '../lib/solicitacaoMessages';
import type { Solicitacao, StatusSolicitacao } from '../types/solicitacaoTypes';
import { COLUMNS } from './kanbanColunas';
import { KanbanColumn } from './KanbanColumn';

type AcaoPendente = { acao: AcaoSolicitacao; card: Solicitacao };

type Props = {
  modeloId?: string;
  dataInicio?: string;
  dataFim?: string;
  onLimparFiltro?: () => void;
};

export function KanbanBoard({ modeloId, dataInicio, dataFim, onLimparFiltro }: Props) {
  const { user } = useAuth();
  const { data: perfil } = usePerfil();
  const isOperador = user?.perfil === 'OPERADOR';
  const temFiltro = Boolean(modeloId || dataInicio || dataFim);
  // Só o operador vê a marca: gestor e administrador veem todas as solicitações.
  const relacaoDe = isOperador
    ? (card: Solicitacao) => relacaoDoOperador(card, perfil?.id)
    : undefined;
  const acoesDe = useAcoesPermitidas();

  // Calculado uma vez: o instante entra na chave das consultas das colunas encerradas.
  const [inicioDos30Dias] = useState(() => inicioDosUltimos30Dias(new Date()));
  const filtrosDoQuadro = { modeloId, criadaEmInicio: dataInicio, criadaEmFim: dataFim };
  const colunas = useColunasDoQuadro(filtrosDoQuadro, inicioDos30Dias);
  const todas = COLUMNS.map((col) => colunas[col.status]);
  const isLoading = todas.some((coluna) => coluna.carregando);
  const error = todas.find((coluna) => coluna.erro)?.erro ?? null;
  const totalDoQuadro = todas.reduce((soma, coluna) => soma + coluna.total, 0);
  // As encerradas só vêm dos últimos 30 dias: quadro vazio não prova que o operador não tem nada.
  const temEncerradaAntiga = useTemSolicitacaoDoOperador({
    enabled: isOperador && totalDoQuadro === 0 && !temFiltro && !isLoading,
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
  if (isOperador && totalDoQuadro === 0 && temFiltro) {
    return (
      <EmptyState
        title="Nenhuma solicitação para este filtro"
        description="Nenhuma das solicitações que você abriu ou recebeu corresponde ao filtro."
        action={
          <Button variant="secondary" onClick={onLimparFiltro}>
            Limpar filtro
          </Button>
        }
      />
    );
  }
  if (isOperador && totalDoQuadro === 0 && temEncerradaAntiga.isLoading) {
    return <LoadingState title="Carregando quadro..." />;
  }
  // Com solicitação fora do recorte, ou sem saber (consulta falhou), não afirma que nunca teve.
  if (isOperador && totalDoQuadro === 0 && temEncerradaAntiga.data === false) {
    return (
      <EmptyState
        title="Você ainda não abriu nem recebeu solicitações"
        description="As solicitações que você abrir e as que forem atribuídas a você aparecem aqui."
        action={
          <Link to="/app/solicitacoes/nova">
            <Button>Nova solicitação</Button>
          </Link>
        }
      />
    );
  }

  /** Propriedades de carga que o quadro repassa à coluna de um status. */
  function cargaDaColuna(status: StatusSolicitacao) {
    const coluna = colunas[status];
    return {
      cards: coluna.cards,
      total: coluna.total,
      temMais: coluna.temMais,
      carregandoMais: coluna.carregandoMais,
      falhouAoCarregarMais: coluna.falhouAoCarregarMais,
      onCarregarMais: coluna.carregarMais,
      aviso: colunaLimitadaAos30Dias(status, filtrosDoQuadro) ? 'Últimos 30 dias' : undefined,
    };
  }

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
        <div className="flex overflow-x-auto rounded-xl border border-line bg-surface-muted">
          {COLUMNS.map((col) => {
            const count = colunas[col.status].total;
            const isActive = col.status === activeTab;
            return (
              <button
                key={col.status}
                type="button"
                onClick={() => setActiveTab(col.status)}
                className={cn(
                  'flex shrink-0 flex-col items-center border-b-2 bg-surface-muted px-4 py-2.5 text-center transition-colors',
                  isActive
                    ? 'border-b-accent font-semibold text-fg'
                    : 'border-b-transparent font-medium text-fg-muted hover:text-fg',
                )}
              >
                <span className="text-lg font-bold tabular-nums leading-none">{count}</span>
                <span className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-xs">
                  <span
                    aria-hidden="true"
                    className={cn('h-1.5 w-1.5 shrink-0 rounded-full', col.pontoClass)}
                  />
                  <span>{col.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile single column */}
        <div className="mt-2">
          <KanbanColumn
            config={activeColumn}
            {...cargaDaColuna(activeTab)}
            isDropTarget={false}
            isInvalidDrop={false}
            mobileView
            canDragCard={canDragCard}
            canAdvanceCard={canAdvanceCard}
            relacaoDe={relacaoDe}
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
              {...cargaDaColuna(col.status)}
              isDropTarget={isDropTarget}
              isInvalidDrop={isInvalidDrop}
              canDragCard={canDragCard}
              canAdvanceCard={canAdvanceCard}
              relacaoDe={relacaoDe}
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
        <DialogoDaAcao
          acao={acaoPendente.acao}
          solicitacao={acaoPendente.card}
          onClose={() => setAcaoPendente(null)}
        />
      )}
    </div>
  );
}
