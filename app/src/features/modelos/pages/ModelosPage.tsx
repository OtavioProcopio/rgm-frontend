import { useState } from 'react';

import { ModelosFilters } from '@/features/admin/modelos/components/ModelosFilters';
import { useModelos } from '@/features/admin/modelos/hooks/useModelos';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Pagination } from '@/shared/components/Pagination/Pagination';

import { ModeloCard } from '../components/ModeloCard';

const PAGE_SIZE = 12;

export function ModelosPage() {
  const [filters, setFilters] = useState<{
    page: number;
    size: number;
    ativo?: boolean;
    codigo?: string;
    maquina?: string;
    descricao?: string;
  }>({ page: 0, size: PAGE_SIZE });
  const { data, error, isLoading } = useModelos(filters);

  return (
    <section>
      <PageHeader
        title="Modelos"
        description="Visualize os modelos de máquinas disponíveis."
      />

      <ModelosFilters
        codigo={filters.codigo}
        maquina={filters.maquina}
        descricao={filters.descricao}
        ativo={filters.ativo}
        onCodigoChange={(codigo) => setFilters((f) => ({ ...f, page: 0, codigo }))}
        onMaquinaChange={(maquina) => setFilters((f) => ({ ...f, page: 0, maquina }))}
        onDescricaoChange={(descricao) => setFilters((f) => ({ ...f, page: 0, descricao }))}
        onAtivoChange={(ativo) => setFilters((f) => ({ ...f, page: 0, ativo }))}
      />

      {isLoading ? <LoadingState title="Carregando modelos..." /> : null}
      {error ? (
        <ErrorState
          title="Não foi possível carregar modelos."
          description="Verifique a conexão e tente novamente."
        />
      ) : null}
      {data && data.content.length === 0 ? (
        <EmptyState title="Nenhum modelo encontrado" description="Nenhum modelo cadastrado ainda." />
      ) : null}

      {data && data.content.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.content.map((modelo) => (
              <ModeloCard key={modelo.id} modelo={modelo} />
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            itemLabel="modelo(s)"
            onPrev={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            onNext={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
          />
        </>
      ) : null}
    </section>
  );
}
