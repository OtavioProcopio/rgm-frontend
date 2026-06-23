import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { canManageModelos } from '@/shared/lib/permissions';
import { useModelos } from '@/features/admin/modelos/hooks/useModelos';

const PAGE_SIZE = 20;

export function ModelosPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ page: 0, size: PAGE_SIZE });
  const { data, error, isLoading } = useModelos(filters);

  const pageInfo = useMemo(
    () =>
      data
        ? `Página ${data.page + 1} de ${Math.max(data.totalPages, 1)}`
        : 'Página 1 de 1',
    [data],
  );

  const canManage = canManageModelos(user?.perfil);

  return (
    <section>
      <PageHeader
        title="Modelos"
        description="Visualize os modelos de máquinas disponíveis."
        actions={
          canManage ? (
            <Link to="/app/admin/modelos/novo">
              <Button>Novo modelo</Button>
            </Link>
          ) : undefined
        }
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.content.map((modelo) => (
              <div
                key={modelo.id}
                className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                {modelo.fotoUrl ? (
                  <img
                    src={modelo.fotoUrl}
                    alt={modelo.codigo}
                    className="mb-3 h-32 w-full rounded object-cover"
                  />
                ) : null}
                <p className="font-semibold text-slate-900 dark:text-white">{modelo.codigo}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{modelo.descricao}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      modelo.ativo
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {modelo.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  {modelo.temPendenciaAberta ? (
                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      Pendência aberta
                    </span>
                  ) : null}
                </div>
                {canManage ? (
                  <Link
                    to={`/app/admin/modelos/${modelo.id}`}
                    className="mt-3 block text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
                  >
                    Ver detalhes →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {pageInfo} • {data.totalElements} modelo(s)
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
    </section>
  );
}
