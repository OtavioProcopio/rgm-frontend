import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { ModeloForm } from '@/features/admin/modelos/components/ModeloForm';
import { useCriarModelo } from '@/features/admin/modelos/hooks/useCriarModelo';
import { getModeloErrorMessage } from '@/features/admin/modelos/lib/modeloMessages';
import type { CriarModeloRequest } from '@/features/admin/modelos/types/modeloTypes';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

export function NovoModeloPage() {
  const navigate = useNavigate();
  const criarModelo = useCriarModelo();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      <PageHeader title="Novo modelo" description="Cadastre um modelo de fundição." />
      {errorMessage ? (
        <div className="mb-4">
          <ErrorState title="Não foi possível criar o modelo" description={errorMessage} />
        </div>
      ) : null}
      <ModeloForm
        mode="create"
        isSubmitting={criarModelo.isPending}
        onSubmit={handleSubmit}
      />
      <div className="mt-4">
        <Link to="/app/modelos" className="text-sm text-slate-500 hover:underline">
          ← Voltar para modelos
        </Link>
      </div>
    </section>
  );
}
