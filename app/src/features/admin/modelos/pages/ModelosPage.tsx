import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { useMaquinas } from '@/features/admin/maquinas/hooks/useMaquinas';
import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { ModelosFilters } from '../components/ModelosFilters';
import { ModelosTable } from '../components/ModelosTable';
import { useDesativarModelo } from '../hooks/useDesativarModelo';
import { useModelos } from '../hooks/useModelos';
import { getModeloErrorMessage } from '../lib/modeloMessages';
import type { Modelo, ModelosFilters as ModelosFiltersType } from '../types/modeloTypes';

const PAGE_SIZE = 20;

export function ModelosPage() {
  const [filters, setFilters] = useState<ModelosFiltersType>({ page: 0, size: PAGE_SIZE });
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, error, isLoading } = useModelos(filters);
  const { data: maquinasData } = useMaquinas({ page: 0, size: 200 });
  const desativarModelo = useDesativarModelo();
  const maquinasMap = useMemo(
    () =>
      new Map(
        (maquinasData?.content ?? []).map((maquina) => [
          maquina.id,
          `${maquina.codigo} - ${maquina.nome}`,
        ]),
      ),
    [maquinasData],
  );

  async function handleDesativar(modelo: Modelo) {
    if (
      !window.confirm(
        'Modelos inativos não devem ser usados em novas solicitações. Deseja continuar?',
      )
    )
      return;
    setActionError(null);
    try {
      await desativarModelo.mutateAsync(modelo.id);
    } catch (mutationError) {
      setActionError(getModeloErrorMessage(mutationError));
    }
  }

  return (
    <section>
      <PageHeader
        title="Modelos"
        description="Gerencie modelos vinculados às máquinas."
        actions={
          <Link to="/app/admin/modelos/novo">
            <Button>Novo modelo</Button>
          </Link>
        }
      />
      <ModelosFilters
        codigo={filters.codigo}
        ativo={filters.ativo}
        onCodigoChange={(codigo) => setFilters((current) => ({ ...current, codigo, page: 0 }))}
        onAtivoChange={(ativo) => setFilters((current) => ({ ...current, ativo, page: 0 }))}
      />
      {actionError ? (
        <div className="mb-4">
          <ErrorState title="Operação não concluída" description={actionError} />
        </div>
      ) : null}
      {isLoading ? <LoadingState title="Carregando modelos..." /> : null}
      {error ? (
        <ErrorState
          title="Não foi possível carregar modelos."
          description={getModeloErrorMessage(error)}
        />
      ) : null}
      {data && data.content.length === 0 ? (
        <EmptyState title="Nenhum modelo encontrado" description="Cadastre o primeiro modelo." />
      ) : null}
      {data && data.content.length > 0 ? (
        <>
          <ModelosTable
            modelos={data.content}
            maquinasMap={maquinasMap}
            isMutating={desativarModelo.isPending}
            onDesativar={handleDesativar}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Página {data.page + 1} de {Math.max(data.totalPages, 1)} • {data.totalElements}{' '}
              modelo(s)
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={filters.page === 0}
                onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={filters.page + 1 >= data.totalPages}
                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
