import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { ModeloForm } from '../components/ModeloForm';
import { useCriarModelo } from '../hooks/useCriarModelo';
import { getModeloErrorMessage } from '../lib/modeloMessages';
import type { CriarModeloRequest } from '../types/modeloTypes';

export function NovoModeloPage() {
  const navigate = useNavigate();
  const criarModelo = useCriarModelo();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    </section>
  );
}
