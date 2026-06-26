import { useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Pagination } from '@/shared/components/Pagination/Pagination';

import { ModelosFilters } from '../components/ModelosFilters';
import { ModelosTable } from '../components/ModelosTable';
import { useDesativarModelo } from '../hooks/useDesativarModelo';
import { useAtivarModelo } from '../hooks/useAtivarModelo';
import { useModelos } from '../hooks/useModelos';
import { getModeloErrorMessage } from '../lib/modeloMessages';
import type { Modelo, ModelosFilters as ModelosFiltersType } from '../types/modeloTypes';

const PAGE_SIZE = 20;

export function ModelosPage() {
  const [filters, setFilters] = useState<ModelosFiltersType>({ page: 0, size: PAGE_SIZE });
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, error, isLoading } = useModelos(filters);
  const desativarModelo = useDesativarModelo();
  const ativarModelo = useAtivarModelo();
  const isMutating = desativarModelo.isPending || ativarModelo.isPending;

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

  async function handleAtivar(modelo: Modelo) {
    if (!window.confirm(`Deseja ativar o modelo ${modelo.codigo}?`)) {
      return;
    }
    setActionError(null);
    try {
      await ativarModelo.mutateAsync(modelo.id);
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
            isMutating={isMutating}
            onDesativar={handleDesativar}
            onAtivar={handleAtivar}
          />
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            itemLabel="modelo(s)"
            onPrev={() => setFilters((c) => ({ ...c, page: c.page - 1 }))}
            onNext={() => setFilters((c) => ({ ...c, page: c.page + 1 }))}
          />
        </>
      ) : null}
    </section>
  );
}
