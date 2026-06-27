import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { ModeloForm } from '../components/ModeloForm';
import { ModeloFotoCapa } from '../components/ModeloFotoCapa';
import { UploadFotoCapaDialog } from '../components/UploadFotoCapaDialog';
import { useEditarModelo } from '../hooks/useEditarModelo';
import { useModelo } from '../hooks/useModelo';
import { useUploadFotoCapa } from '../hooks/useUploadFotoCapa';
import { getModeloErrorMessage } from '../lib/modeloMessages';
import type { EditarModeloRequest } from '../types/modeloTypes';

export function EditarModeloPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: modelo, error, isLoading } = useModelo(id);
  const editarModelo = useEditarModelo();
  const uploadFoto = useUploadFotoCapa();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(payload: EditarModeloRequest) {
    if (!id) return;
    setErrorMessage(null);
    try {
      await editarModelo.mutateAsync({ id, payload });
      navigate('/app/admin/modelos');
    } catch (mutationError) {
      setErrorMessage(getModeloErrorMessage(mutationError));
    }
  }

  async function handleUpload(file: File) {
    if (!id) return;
    setErrorMessage(null);
    try {
      await uploadFoto.mutateAsync({ id, file });
    } catch (mutationError) {
      setErrorMessage(getModeloErrorMessage(mutationError));
    }
  }

  return (
    <section>
      <PageHeader
        title="Editar modelo"
        description="Atualize os dados e o encaixe de máquina do modelo."
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
        <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
          <ModeloForm
            mode="edit"
            modelo={modelo}
            isSubmitting={editarModelo.isPending}
            onSubmit={handleSubmit}
          />
          <aside className="space-y-4">
            <ModeloFotoCapa fotoUrl={modelo.fotoUrl} />
            <UploadFotoCapaDialog isUploading={uploadFoto.isPending} onUpload={handleUpload} />
          </aside>
        </div>
      ) : null}
    </section>
  );
}
