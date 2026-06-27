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
import { useModelos } from '../hooks/useModelos';
import { getModeloErrorMessage } from '../lib/modeloMessages';
import type { ModelosFilters as ModelosFiltersType } from '../types/modeloTypes';

const PAGE_SIZE = 20;

export function ModelosPage() {
  const [filters, setFilters] = useState<ModelosFiltersType>({ page: 0, size: PAGE_SIZE });
  const { data, error, isLoading } = useModelos(filters);

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
        maquina={filters.maquina}
        descricao={filters.descricao}
        ativo={filters.ativo}
        onCodigoChange={(codigo) => setFilters((current) => ({ ...current, codigo, page: 0 }))}
        onMaquinaChange={(maquina) => setFilters((current) => ({ ...current, maquina, page: 0 }))}
        onDescricaoChange={(descricao) => setFilters((current) => ({ ...current, descricao, page: 0 }))}
        onAtivoChange={(ativo) => setFilters((current) => ({ ...current, ativo, page: 0 }))}
      />
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
          <ModelosTable modelos={data.content} />
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
