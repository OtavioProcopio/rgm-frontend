import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { cn } from '@/shared/lib/cn';
import { canOperateSolicitacoes } from '@/shared/lib/permissions';

import { KanbanBoard } from '../components/KanbanBoard';
import { SolicitacaoCard } from '../components/SolicitacaoCard';
import { SolicitacaoFilters } from '../components/SolicitacaoFilters';
import { useSolicitacoes } from '../hooks/useSolicitacoes';
import { getSolicitacaoErrorMessage } from '../lib/solicitacaoMessages';
import type { SolicitacoesFilters } from '../types/solicitacaoTypes';

const PAGE_SIZE = 20;
type View = 'lista' | 'kanban';

export function SolicitacoesPage() {
  const { user } = useAuth();
  const [view, setView] = useState<View>('kanban');
  const [filters, setFilters] = useState<SolicitacoesFilters>({ page: 0, size: PAGE_SIZE });
  const { data, error, isLoading } = useSolicitacoes(filters, { enabled: view === 'lista' });

  const pageInfo = useMemo(
    () =>
      data ? `Página ${data.page + 1} de ${Math.max(data.totalPages, 1)}` : 'Página 1 de 1',
    [data],
  );

  const canCreate = canOperateSolicitacoes(user?.perfil);

  return (
    <section>
      <PageHeader
        title="Solicitações"
        description="Gerencie as solicitações de manutenção."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setView('kanban')}
                className={cn(
                  'rounded-l-md px-3 py-1.5 text-sm font-medium transition-colors',
                  view === 'kanban'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700',
                )}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setView('lista')}
                className={cn(
                  'rounded-r-md px-3 py-1.5 text-sm font-medium transition-colors',
                  view === 'lista'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700',
                )}
              >
                Lista
              </button>
            </div>
            {canCreate ? (
              <Link to="/app/solicitacoes/nova">
                <Button>Nova solicitação</Button>
              </Link>
            ) : null}
          </div>
        }
      />

      {view === 'kanban' ? (
        <KanbanBoard modeloId={filters.modeloId} />
      ) : (
        <>
          <SolicitacaoFilters filters={filters} onChange={setFilters} />

          {isLoading ? <LoadingState title="Carregando solicitações..." /> : null}
          {error ? (
            <ErrorState
              title="Não foi possível carregar solicitações."
              description={getSolicitacaoErrorMessage(error)}
            />
          ) : null}
          {data && data.content.length === 0 ? (
            <EmptyState
              title="Nenhuma solicitação encontrada"
              description={
                filters.status
                  ? 'Não há solicitações com este status.'
                  : 'Nenhuma solicitação cadastrada ainda.'
              }
            />
          ) : null}

          {data && data.content.length > 0 ? (
            <>
              <div className="space-y-3">
                {data.content.map((s) => (
                  <SolicitacaoCard key={s.id} solicitacao={s} />
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {pageInfo} • {data.totalElements} solicitação(ões)
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={filters.page === 0}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={filters.page + 1 >= data.totalPages}
                    onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}
