import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { ExportarPdfButton } from '@/shared/components/ExportarPdfButton/ExportarPdfButton';
import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { Input } from '@/shared/components/Input/Input';
import { PageHeader, type AcaoDoMenu } from '@/shared/components/PageHeader/PageHeader';
import { Pagination } from '@/shared/components/Pagination/Pagination';
import { useExportarPdf } from '@/shared/hooks/useExportarPdf';
import { cn } from '@/shared/lib/cn';
import { canOperateSolicitacoes } from '@/shared/lib/permissions';

import { solicitacoesApi } from '../api/solicitacoesApi';
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
  const [searchParams] = useSearchParams();
  const maquinaFromUrl = searchParams.get('maquina') || undefined;
  const [view, setView] = useState<View>(maquinaFromUrl ? 'lista' : 'kanban');
  const [filters, setFilters] = useState<SolicitacoesFilters>({
    page: 0,
    size: PAGE_SIZE,
    maquina: maquinaFromUrl,
  });
  const { data, error, isLoading } = useSolicitacoes(filters, { enabled: view === 'lista' });

  const canCreate = canOperateSolicitacoes(user?.perfil);
  const buscarPdf = (): Promise<Blob> => solicitacoesApi.exportar(filters);
  const nomeDoPdf = (): string => `relatorio_solicitacoes_${Date.now()}.pdf`;
  const { exportar, exportando, erro } = useExportarPdf({
    buscar: buscarPdf,
    nomeDoArquivo: nomeDoPdf,
  });
  const acaoExportar: AcaoDoMenu = {
    rotulo: exportando ? 'Exportando...' : 'Exportar PDF',
    onSelect: exportar,
    desabilitada: exportando,
  };

  return (
    <section>
      <PageHeader
        title="Solicitações"
        description="Gerencie as solicitações de manutenção."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border border-line bg-surface">
              <button
                type="button"
                onClick={() => setView('kanban')}
                className={cn(
                  'rounded-l-md px-3 py-1.5 text-sm font-medium transition-colors pointer-coarse:min-h-11',
                  view === 'kanban'
                    ? 'bg-accent text-on-accent'
                    : 'text-fg-muted hover:bg-surface-muted',
                )}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setView('lista')}
                className={cn(
                  'rounded-r-md px-3 py-1.5 text-sm font-medium transition-colors pointer-coarse:min-h-11',
                  view === 'lista'
                    ? 'bg-accent text-on-accent'
                    : 'text-fg-muted hover:bg-surface-muted',
                )}
              >
                Lista
              </button>
            </div>
            {canCreate ? (
              <Link to="/app/solicitacoes/nova">
                <Button>Nova solicitação</Button>
              </Link>
            ) : (
              <ExportarPdfButton buscar={buscarPdf} nomeDoArquivo={nomeDoPdf} />
            )}
          </div>
        }
        maisAcoes={canCreate ? [acaoExportar] : undefined}
      />
      {canCreate && erro ? (
        <ErrorState title="Exportação não concluída" description={erro} />
      ) : null}

      {view === 'kanban' ? (
        <>
          <div className="mb-3 flex flex-wrap gap-4">
            <div className="w-full sm:w-44">
              <Input
                type="date"
                label="Criada a partir de"
                value={filters.criadaEmInicio ? filters.criadaEmInicio.split('T')[0] : ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    criadaEmInicio: e.target.value ? `${e.target.value}T00:00:00Z` : undefined,
                  }))
                }
              />
            </div>
            <div className="w-full sm:w-44">
              <Input
                type="date"
                label="Criada até"
                value={filters.criadaEmFim ? filters.criadaEmFim.split('T')[0] : ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    criadaEmFim: e.target.value ? `${e.target.value}T23:59:59Z` : undefined,
                  }))
                }
              />
            </div>
          </div>
          <KanbanBoard
            modeloId={filters.modeloId}
            dataInicio={filters.criadaEmInicio}
            dataFim={filters.criadaEmFim}
            onLimparFiltro={() =>
              setFilters((f) => ({
                ...f,
                modeloId: undefined,
                criadaEmInicio: undefined,
                criadaEmFim: undefined,
              }))
            }
          />
        </>
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
