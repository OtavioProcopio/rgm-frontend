import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { DeleteUsuarioDialog } from '../components/DeleteUsuarioDialog';
import { UsuariosFilters } from '../components/UsuariosFilters';
import { UsuariosTable } from '../components/UsuariosTable';
import { useAtivarUsuario } from '../hooks/useAtivarUsuario';
import { useDesativarUsuario } from '../hooks/useDesativarUsuario';
import { useExcluirUsuario } from '../hooks/useExcluirUsuario';
import { useUsuarios } from '../hooks/useUsuarios';
import { getUsuarioErrorMessage } from '../lib/usuarioMessages';
import type {
  PerfilUsuario,
  Usuario,
  UsuariosFilters as UsuariosFiltersType,
} from '../types/usuarioTypes';

const PAGE_SIZE = 20;

export function UsuariosPage() {
  const [filters, setFilters] = useState<UsuariosFiltersType>({
    page: 0,
    size: PAGE_SIZE,
  });
  const [selectedForDelete, setSelectedForDelete] = useState<Usuario | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, error, isLoading } = useUsuarios(filters);
  const ativarUsuario = useAtivarUsuario();
  const desativarUsuario = useDesativarUsuario();
  const excluirUsuario = useExcluirUsuario();
  const isMutating =
    ativarUsuario.isPending || desativarUsuario.isPending || excluirUsuario.isPending;

  const pageInfo = useMemo(() => {
    if (!data) {
      return 'Página 1 de 1';
    }

    return `Página ${data.page + 1} de ${Math.max(data.totalPages, 1)}`;
  }, [data]);

  async function handleAtivar(usuario: Usuario) {
    setActionError(null);

    try {
      await ativarUsuario.mutateAsync(usuario.id);
    } catch (mutationError) {
      setActionError(getUsuarioErrorMessage(mutationError));
    }
  }

  async function handleDesativar(usuario: Usuario) {
    if (!window.confirm(`Deseja desativar ${usuario.nome}?`)) {
      return;
    }

    setActionError(null);

    try {
      await desativarUsuario.mutateAsync(usuario.id);
    } catch (mutationError) {
      setActionError(getUsuarioErrorMessage(mutationError));
    }
  }

  async function handleExcluir() {
    if (!selectedForDelete) {
      return;
    }

    setActionError(null);

    try {
      await excluirUsuario.mutateAsync(selectedForDelete.id);
      setSelectedForDelete(null);
    } catch (mutationError) {
      setActionError(getUsuarioErrorMessage(mutationError));
    }
  }

  return (
    <section>
      <PageHeader
        title="Usuários"
        description="Gerencie operadores, gestores, administradores e prestadores externos."
        actions={
          <Link to="/app/admin/usuarios/novo">
            <Button>Novo usuário</Button>
          </Link>
        }
      />

      <UsuariosFilters
        perfil={filters.perfil}
        ativo={filters.ativo}
        onPerfilChange={(perfil?: PerfilUsuario) =>
          setFilters((current) => ({ ...current, perfil, page: 0 }))
        }
        onAtivoChange={(ativo?: boolean) =>
          setFilters((current) => ({ ...current, ativo, page: 0 }))
        }
      />

      {actionError ? (
        <div className="mb-4">
          <ErrorState title="Operação não concluída" description={actionError} />
        </div>
      ) : null}

      {selectedForDelete ? (
        <div className="mb-4">
          <DeleteUsuarioDialog
            usuario={selectedForDelete}
            isDeleting={excluirUsuario.isPending}
            onCancel={() => setSelectedForDelete(null)}
            onConfirm={handleExcluir}
          />
        </div>
      ) : null}

      {isLoading ? <LoadingState title="Carregando usuários..." /> : null}

      {error ? (
        <ErrorState
          title="Não foi possível carregar usuários."
          description={getUsuarioErrorMessage(error)}
        />
      ) : null}

      {data && data.content.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description="Ajuste os filtros ou cadastre um novo usuário."
        />
      ) : null}

      {data && data.content.length > 0 ? (
        <>
          <UsuariosTable
            usuarios={data.content}
            isMutating={isMutating}
            onAtivar={handleAtivar}
            onDesativar={handleDesativar}
            onExcluir={setSelectedForDelete}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {pageInfo} • {data.totalElements} usuário(s)
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
                disabled={!data || filters.page + 1 >= data.totalPages}
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
