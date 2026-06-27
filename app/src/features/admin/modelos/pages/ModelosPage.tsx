import { useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/shared/components/Button/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog/ConfirmDialog';
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

type PendingAction = { type: 'desativar' | 'ativar'; modelo: Modelo };

const PAGE_SIZE = 20;

export function ModelosPage() {
  const [filters, setFilters] = useState<ModelosFiltersType>({ page: 0, size: PAGE_SIZE });
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, error, isLoading } = useModelos(filters);
  const desativarModelo = useDesativarModelo();
  const ativarModelo = useAtivarModelo();
  const isMutating = desativarModelo.isPending || ativarModelo.isPending;

  async function handleConfirmAction() {
    if (!pendingAction) return;
    setActionError(null);
    try {
      if (pendingAction.type === 'desativar') {
        await desativarModelo.mutateAsync(pendingAction.modelo.id);
      } else {
        await ativarModelo.mutateAsync(pendingAction.modelo.id);
      }
      setPendingAction(null);
    } catch (mutationError) {
      setActionError(getModeloErrorMessage(mutationError));
      setPendingAction(null);
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
        maquina={filters.maquina}
        descricao={filters.descricao}
        ativo={filters.ativo}
        onCodigoChange={(codigo) => setFilters((current) => ({ ...current, codigo, page: 0 }))}
        onMaquinaChange={(maquina) => setFilters((current) => ({ ...current, maquina, page: 0 }))}
        onDescricaoChange={(descricao) => setFilters((current) => ({ ...current, descricao, page: 0 }))}
        onAtivoChange={(ativo) => setFilters((current) => ({ ...current, ativo, page: 0 }))}
      />
      {actionError ? (
        <div className="mb-4">
          <ErrorState title="Operação não concluída" description={actionError} />
        </div>
      ) : null}
      {pendingAction ? (
        <div className="mb-4">
          {pendingAction.type === 'desativar' ? (
            <ConfirmDialog
              title="Desativar modelo"
              message="Modelos inativos não devem ser usados em novas solicitações. Deseja continuar?"
              confirmLabel="Desativar"
              variant="danger"
              isPending={isMutating}
              onCancel={() => setPendingAction(null)}
              onConfirm={handleConfirmAction}
            />
          ) : (
            <ConfirmDialog
              title="Ativar modelo"
              message={`Deseja ativar o modelo ${pendingAction.modelo.codigo}?`}
              confirmLabel="Ativar"
              variant="warning"
              isPending={isMutating}
              onCancel={() => setPendingAction(null)}
              onConfirm={handleConfirmAction}
            />
          )}
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
            onDesativar={(modelo) => setPendingAction({ type: 'desativar', modelo })}
            onAtivar={(modelo) => setPendingAction({ type: 'ativar', modelo })}
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
