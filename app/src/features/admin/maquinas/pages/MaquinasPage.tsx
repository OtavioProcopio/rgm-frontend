import { useState } from 'react';
import { Link } from 'react-router';

import { useMaquinas } from '@/features/admin/modelos/hooks/useMaquinas';
import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { MaquinasTable } from '../components/MaquinasTable';
import { useAtivarMaquina } from '../hooks/useAtivarMaquina';
import { useDesativarMaquina } from '../hooks/useDesativarMaquina';
import { getMaquinaErrorMessage } from '../lib/maquinaMessages';
import type { Maquina } from '@/features/admin/modelos/types/maquinaTypes';

export function MaquinasPage() {
  const { data: maquinas, error, isLoading } = useMaquinas();
  const [actionError, setActionError] = useState<string | null>(null);
  const ativarMaquina = useAtivarMaquina();
  const desativarMaquina = useDesativarMaquina();
  const isMutating = ativarMaquina.isPending || desativarMaquina.isPending;

  async function handleAtivar(maquina: Maquina) {
    setActionError(null);
    try {
      await ativarMaquina.mutateAsync(maquina.id);
    } catch (mutationError) {
      setActionError(getMaquinaErrorMessage(mutationError));
    }
  }

  async function handleDesativar(maquina: Maquina) {
    setActionError(null);
    try {
      await desativarMaquina.mutateAsync(maquina.id);
    } catch (mutationError) {
      setActionError(getMaquinaErrorMessage(mutationError));
    }
  }

  return (
    <section>
      <PageHeader
        title="Máquinas"
        description="Catálogo de máquinas/encaixes usado no cadastro de modelos."
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

      {isLoading ? <LoadingState title="Carregando máquinas..." /> : null}

      {error ? (
        <ErrorState
          title="Não foi possível carregar as máquinas."
          description={getMaquinaErrorMessage(error)}
        />
      ) : null}

      {maquinas && maquinas.length === 0 ? (
        <EmptyState
          title="Nenhuma máquina cadastrada"
          description="Cadastre a primeira máquina do catálogo."
        />
      ) : null}

      {maquinas && maquinas.length > 0 ? (
        <MaquinasTable
          maquinas={maquinas}
          isMutating={isMutating}
          onAtivar={handleAtivar}
          onDesativar={handleDesativar}
        />
      ) : null}
    </section>
  );
}
