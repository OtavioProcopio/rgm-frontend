import { useState } from 'react';
import { Link } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Pagination } from '@/shared/components/Pagination/Pagination';
import { cn } from '@/shared/lib/cn';
import { canOperateSolicitacoes } from '@/shared/lib/permissions';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { KanbanBoard } from '../components/KanbanBoard';
import { SolicitacaoCard } from '../components/SolicitacaoCard';
import { SolicitacaoFilters } from '../components/SolicitacaoFilters';
import { useSolicitacaoEvents } from '../hooks/useSolicitacaoEvents';
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

  useSolicitacaoEvents();
  const [isExporting, setIsExporting] = useState(false);

  const canCreate = canOperateSolicitacoes(user?.perfil);

  async function handleExportar() {
    setIsExporting(true);
    try {
      const blob = await solicitacoesApi.exportar(filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_solicitacoes_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro ao exportar relatório:', err);
    } finally {
      setIsExporting(false);
    }
  }

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
            <Button
              type="button"
              variant="secondary"
              disabled={isExporting}
              onClick={handleExportar}
            >
              {isExporting ? 'Exportando...' : 'Exportar PDF'}
            </Button>
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
                filters.status || filters.modeloId
                  ? 'Nenhuma solicitação com os filtros aplicados.'
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
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                itemLabel="solicitação(ões)"
                onPrev={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                onNext={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              />
            </>
          ) : null}
        </>
      )}
    </section>
  );
}
