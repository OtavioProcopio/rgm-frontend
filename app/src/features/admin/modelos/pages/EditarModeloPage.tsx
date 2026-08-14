import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { ModeloForm } from '../components/ModeloForm';
import { useEditarModelo } from '../hooks/useEditarModelo';
import { useModelo } from '../hooks/useModelo';
import { getModeloErrorMessage } from '../lib/modeloMessages';
import type { EditarModeloRequest } from '../types/modeloTypes';

export function EditarModeloPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: modelo, error, isLoading } = useModelo(id);
  const editarModelo = useEditarModelo();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(payload: EditarModeloRequest) {
    if (!id) return;
    setErrorMessage(null);
    try {
      await editarModelo.mutateAsync({ id, payload });
      navigate(`/app/admin/modelos/${id}`);
    } catch (mutationError) {
      setErrorMessage(getModeloErrorMessage(mutationError));
    }
  }

  return (
    <section>
      <PageHeader
        title="Editar modelo"
        description="Atualize os dados e o encaixe de máquina do modelo."
        actions={id ? (
          <Link
            to={`/app/admin/modelos/${id}`}
            className="inline-flex items-center justify-center rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Voltar
          </Link>
        ) : null}
      />
      {isLoading ? <LoadingState title="Carregando modelo..." /> : null}
      {error ? (
        <ErrorState title="Modelo não encontrado" description={getModeloErrorMessage(error)} />
      ) : null}
      {errorMessage ? (
        <div className="mb-4">
          <ErrorState title="Operação não concluída" description={errorMessage} />
        </div>
      ) : null}
      {modelo ? (
        <div className="max-w-2xl">
          <ModeloForm
            mode="edit"
            modelo={modelo}
            isSubmitting={editarModelo.isPending}
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}
    </section>
  );
}
