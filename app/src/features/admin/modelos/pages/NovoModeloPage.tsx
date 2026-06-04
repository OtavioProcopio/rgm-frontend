import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { useMaquinas } from '@/features/admin/maquinas/hooks/useMaquinas';
import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { ModeloForm } from '../components/ModeloForm';
import { useCriarModelo } from '../hooks/useCriarModelo';
import { getModeloErrorMessage } from '../lib/modeloMessages';
import type { CriarModeloRequest } from '../types/modeloTypes';

export function NovoModeloPage() {
  const navigate = useNavigate();
  const { data: maquinasData, error, isLoading } = useMaquinas({ page: 0, size: 200 });
  const criarModelo = useCriarModelo();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const maquinas = maquinasData?.content ?? [];

  async function handleSubmit(payload: CriarModeloRequest) {
    setErrorMessage(null);
    try {
      await criarModelo.mutateAsync(payload);
      navigate('/app/admin/modelos');
    } catch (mutationError) {
      setErrorMessage(getModeloErrorMessage(mutationError));
    }
  }

  return (
    <section>
      <PageHeader title="Novo modelo" description="Cadastre um modelo vinculado a uma máquina." />
      {isLoading ? <LoadingState title="Carregando máquinas..." /> : null}
      {error ? (
        <ErrorState
          title="Não foi possível carregar máquinas"
          description={getModeloErrorMessage(error)}
        />
      ) : null}
      {!isLoading && maquinas.length === 0 ? (
        <EmptyState
          title="Nenhuma máquina cadastrada"
          description="Cadastre uma máquina antes de criar modelos."
        />
      ) : null}
      {!isLoading && maquinas.length === 0 ? (
        <div className="mt-4">
          <Link to="/app/admin/maquinas/novo">
            <Button>Nova máquina</Button>
          </Link>
        </div>
      ) : null}
      {errorMessage ? (
        <div className="mb-4">
          <ErrorState title="Não foi possível criar o modelo" description={errorMessage} />
        </div>
      ) : null}
      {maquinas.length > 0 ? (
        <ModeloForm
          mode="create"
          maquinas={maquinas}
          isSubmitting={criarModelo.isPending}
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  );
}
