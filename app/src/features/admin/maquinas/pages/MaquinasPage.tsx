import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { DeleteMaquinaDialog } from '../components/DeleteMaquinaDialog';
import { MaquinasTable } from '../components/MaquinasTable';
import { useDesativarMaquina } from '../hooks/useDesativarMaquina';
import { useExcluirMaquina } from '../hooks/useExcluirMaquina';
import { useMaquinas } from '../hooks/useMaquinas';
import { getMaquinaErrorMessage } from '../lib/maquinaMessages';
import type { Maquina, MaquinasFilters } from '../types/maquinaTypes';

const PAGE_SIZE = 20;

export function MaquinasPage() {
  const [filters, setFilters] = useState<MaquinasFilters>({ page: 0, size: PAGE_SIZE });
  const [selectedForDelete, setSelectedForDelete] = useState<Maquina | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, error, isLoading } = useMaquinas(filters);
  const desativarMaquina = useDesativarMaquina();
  const excluirMaquina = useExcluirMaquina();
  const isMutating = desativarMaquina.isPending || excluirMaquina.isPending;
  const pageInfo = useMemo(
    () => (data ? `Página ${data.page + 1} de ${Math.max(data.totalPages, 1)}` : 'Página 1 de 1'),
    [data],
  );

  async function handleDesativar(maquina: Maquina) {
    if (!window.confirm(`Deseja desativar ${maquina.codigo} - ${maquina.nome}?`)) {
      return;
    }

    setActionError(null);

    try {
      await desativarMaquina.mutateAsync(maquina.id);
    } catch (mutationError) {
      setActionError(getMaquinaErrorMessage(mutationError));
    }
  }

  async function handleExcluir() {
    if (!selectedForDelete) {
      return;
    }

    setActionError(null);

    try {
      await excluirMaquina.mutateAsync(selectedForDelete.id);
      setSelectedForDelete(null);
    } catch (mutationError) {
      setActionError(getMaquinaErrorMessage(mutationError));
    }
  }

  return (
    <section>
      <PageHeader
        title="Máquinas"
        description="Gerencie máquinas disponíveis para os modelos."
        actions={
          <Link to="/app/admin/maquinas/novo">
            <Button>Nova máquina</Button>
          </Link>
        }
      />

      {actionError ? (
        <div className="mb-4">
          <ErrorState title="Operação não concluída" description={actionError} />
        </div>
      ) : null}

      {selectedForDelete ? (
        <div className="mb-4">
          <DeleteMaquinaDialog
            maquina={selectedForDelete}
            isDeleting={excluirMaquina.isPending}
            onCancel={() => setSelectedForDelete(null)}
            onConfirm={handleExcluir}
          />
        </div>
      ) : null}

      {isLoading ? <LoadingState title="Carregando máquinas..." /> : null}
      {error ? (
        <ErrorState
          title="Não foi possível carregar máquinas."
          description={getMaquinaErrorMessage(error)}
        />
      ) : null}
      {data && data.content.length === 0 ? (
        <EmptyState title="Nenhuma máquina encontrada" description="Cadastre a primeira máquina." />
      ) : null}
      {data && data.content.length > 0 ? (
        <>
          <MaquinasTable
            maquinas={data.content}
            isMutating={isMutating}
            onDesativar={handleDesativar}
            onExcluir={setSelectedForDelete}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {pageInfo} • {data.totalElements} máquina(s)
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
