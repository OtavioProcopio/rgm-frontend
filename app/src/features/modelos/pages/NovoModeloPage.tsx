import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { useMaquinasPublico } from '@/features/admin/maquinas/hooks/useMaquinasPublico';
import { ModeloForm } from '@/features/admin/modelos/components/ModeloForm';
import { useCriarModelo } from '@/features/admin/modelos/hooks/useCriarModelo';
import { getModeloErrorMessage } from '@/features/admin/modelos/lib/modeloMessages';
import type { CriarModeloRequest } from '@/features/admin/modelos/types/modeloTypes';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

export function NovoModeloPage() {
  const navigate = useNavigate();
  const { data: maquinasData, error, isLoading } = useMaquinasPublico({ page: 0, size: 200 });
  const criarModelo = useCriarModelo();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const maquinas = maquinasData?.content ?? [];

  async function handleSubmit(payload: CriarModeloRequest) {
    setErrorMessage(null);
    try {
      await criarModelo.mutateAsync(payload);
      navigate('/app/modelos');
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
          description="Peça ao administrador para cadastrar uma máquina antes de criar modelos."
        />
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
      <div className="mt-4">
        <Link to="/app/modelos" className="text-sm text-slate-500 hover:underline">
          ← Voltar para modelos
        </Link>
      </div>
    </section>
  );
}
