import { useState } from 'react';
import { Link } from 'react-router';

import { useTiposModelo } from '@/features/admin/modelos/hooks/useTiposModelo';
import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { useToast } from '@/shared/components/Toast/toastContext';

import { TiposModeloTable } from '../components/TiposModeloTable';
import { useAtivarTipoModelo } from '../hooks/useAtivarTipoModelo';
import { useDesativarTipoModelo } from '../hooks/useDesativarTipoModelo';
import { getTipoModeloErrorMessage } from '../lib/tipoModeloMessages';
import type { TipoDeModelo } from '@/features/admin/modelos/types/tipoModeloTypes';

export function TiposModeloPage() {
  const { data: tiposModelo, error, isLoading, refetch } = useTiposModelo();
  const [actionError, setActionError] = useState<string | null>(null);
  const ativarTipoModelo = useAtivarTipoModelo();
  const desativarTipoModelo = useDesativarTipoModelo();
  const { avisar } = useToast();
  const isMutating = ativarTipoModelo.isPending || desativarTipoModelo.isPending;

  async function handleAtivar(tipoModelo: TipoDeModelo) {
    setActionError(null);
    try {
      await ativarTipoModelo.mutateAsync(tipoModelo.id);
      avisar('Tipo de modelo ativado');
    } catch (mutationError) {
      setActionError(getTipoModeloErrorMessage(mutationError));
    }
  }

  async function handleDesativar(tipoModelo: TipoDeModelo) {
    setActionError(null);
    try {
      await desativarTipoModelo.mutateAsync(tipoModelo.id);
      avisar('Tipo de modelo desativado');
    } catch (mutationError) {
      setActionError(getTipoModeloErrorMessage(mutationError));
    }
  }

  return (
    <section>
      <PageHeader
        title="Tipos de modelo"
        description="Catálogo de tipos usado no cadastro de modelos."
        actions={
          <Link to="/app/admin/tipos-modelo/novo">
            <Button>Novo tipo de modelo</Button>
          </Link>
        }
      />

      {actionError ? (
        <div className="mb-4">
          <ErrorState title="Operação não concluída" description={actionError} />
        </div>
      ) : null}

      {isLoading ? <LoadingState title="Carregando tipos de modelo..." /> : null}

      {error ? (
        <ErrorState
          title="Não foi possível carregar os tipos de modelo."
          description={getTipoModeloErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      ) : null}

      {tiposModelo && tiposModelo.length === 0 ? (
        <EmptyState
          title="Nenhum tipo de modelo cadastrado"
          description="Cadastre o primeiro tipo de modelo do catálogo."
        />
      ) : null}

      {tiposModelo && tiposModelo.length > 0 ? (
        <TiposModeloTable
          tiposModelo={tiposModelo}
          isMutating={isMutating}
          onAtivar={handleAtivar}
          onDesativar={handleDesativar}
        />
      ) : null}
    </section>
  );
}
