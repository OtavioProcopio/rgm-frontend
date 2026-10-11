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
import { lerFiltrosDaUrl } from '../lib/filtrosDaUrl';
import { getSolicitacaoErrorMessage } from '../lib/solicitacaoMessages';
import { temFiltroAtivo } from '../lib/temFiltroAtivo';
import type { SolicitacoesFilters } from '../types/solicitacaoTypes';

const PAGE_SIZE = 20;
type View = 'lista' | 'kanban';

type EstadoInicial = { view: View; filters: SolicitacoesFilters };

/** Visão e filtros com que a página abre, lidos da URL uma única vez. */
function useEstadoInicialDaUrl(): EstadoInicial {
  const [searchParams] = useSearchParams();
  const [inicial] = useState<EstadoInicial>(() => {
    const { filtros, temFiltroDoPainel } = lerFiltrosDaUrl(searchParams);
    return {
      view: temFiltroDoPainel || filtros.maquina || filtros.q ? 'lista' : 'kanban',
      filters: { page: 0, size: PAGE_SIZE, ...filtros },
    };
  });
  return inicial;
}

type AlternadorProps = { view: View; onChange: (view: View) => void };

function AlternadorDeVisao({ view, onChange }: AlternadorProps) {
  const classe = (ativa: boolean, canto: string) =>
    cn(
      `${canto} px-3 py-1.5 text-sm font-medium transition-colors pointer-coarse:min-h-11`,
      ativa ? 'bg-accent text-on-accent' : 'text-fg-muted hover:bg-surface-muted',
    );
  return (
    <div className="flex rounded-md border border-line bg-surface">
      <button
        type="button"
        onClick={() => onChange('kanban')}
        className={classe(view === 'kanban', 'rounded-l-md')}
      >
        Kanban
      </button>
      <button
        type="button"
        onClick={() => onChange('lista')}
        className={classe(view === 'lista', 'rounded-r-md')}
      >
        Lista
      </button>
    </div>
  );
}

type FiltrosProps = {
  filters: SolicitacoesFilters;
  setFilters: React.Dispatch<React.SetStateAction<SolicitacoesFilters>>;
};

/** Período de criação do quadro: as duas datas. */
function PeriodoDoQuadro({ filters, setFilters }: FiltrosProps) {
  const alterar =
    (campo: 'criadaEmInicio' | 'criadaEmFim', hora: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFilters((f) => ({
        ...f,
        [campo]: e.target.value ? `${e.target.value}T${hora}Z` : undefined,
      }));
  return (
    <div className="mb-3 flex flex-wrap gap-4">
      <div className="w-full sm:w-44">
        <Input
          type="date"
          label="Criada a partir de"
          value={filters.criadaEmInicio ? filters.criadaEmInicio.split('T')[0] : ''}
          onChange={alterar('criadaEmInicio', '00:00:00')}
        />
      </div>
      <div className="w-full sm:w-44">
        <Input
          type="date"
          label="Criada até"
          value={filters.criadaEmFim ? filters.criadaEmFim.split('T')[0] : ''}
          onChange={alterar('criadaEmFim', '23:59:59')}
        />
      </div>
    </div>
  );
}

function VisaoKanban({ filters, setFilters }: FiltrosProps) {
  return (
    <>
      <PeriodoDoQuadro filters={filters} setFilters={setFilters} />
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
  );
}

function VisaoLista({ filters, setFilters }: FiltrosProps) {
  const { data, error, isLoading, refetch } = useSolicitacoes(filters, { enabled: true });
  return (
    <>
      <SolicitacaoFilters filters={filters} onChange={setFilters} />

      {isLoading ? <LoadingState title="Carregando solicitações..." /> : null}
      {error ? (
        <ErrorState
          title="Não foi possível carregar solicitações."
          description={getSolicitacaoErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      ) : null}
      {data && data.content.length === 0 ? (
        <EmptyState
          title="Nenhuma solicitação encontrada"
          description={
            temFiltroAtivo(filters)
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
  );
}

export function SolicitacoesPage() {
  const { user } = useAuth();
  const inicial = useEstadoInicialDaUrl();
  const [view, setView] = useState<View>(inicial.view);
  const [filters, setFilters] = useState<SolicitacoesFilters>(inicial.filters);

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
            <AlternadorDeVisao view={view} onChange={setView} />
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
        <VisaoKanban filters={filters} setFilters={setFilters} />
      ) : (
        <VisaoLista filters={filters} setFilters={setFilters} />
      )}
    </section>
  );
}
