import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { ModeloForm } from '../components/ModeloForm';
import { useCriarModelo } from '../hooks/useCriarModelo';
import { getModeloErrorMessage } from '../lib/modeloMessages';
import type { CriarModeloRequest } from '../types/modeloTypes';

type Props = {
  backPath?: string;
};

export function NovoModeloPage({ backPath }: Props) {
  const navigate = useNavigate();
  const criarModelo = useCriarModelo();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const resolvedBackPath = backPath ?? '/app/admin/modelos';

  async function handleSubmit(payload: CriarModeloRequest) {
    setErrorMessage(null);
    try {
      const created = await criarModelo.mutateAsync(payload);
      navigate(`/app/admin/modelos/${created.id}`);
    } catch (mutationError) {
      setErrorMessage(getModeloErrorMessage(mutationError));
    }
  }

  return (
    <section>
      <PageHeader
        title="Novo modelo"
        description="Cadastre um modelo de fundição. A galeria de fotos pode ser adicionada depois, na página de detalhes."
      />
      {errorMessage ? (
        <div className="mb-4">
          <ErrorState title="Não foi possível criar o modelo" description={errorMessage} />
        </div>
      ) : null}
      <ModeloForm mode="create" isSubmitting={criarModelo.isPending} onSubmit={handleSubmit} />
      <div className="mt-4">
        <Link to={resolvedBackPath} className="text-sm text-slate-500 hover:underline">
          ← Voltar para modelos
        </Link>
      </div>
    </section>
  );
}
