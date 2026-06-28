import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { ModeloForm } from '../components/ModeloForm';
import { useCriarModelo } from '../hooks/useCriarModelo';
import { useUploadFotoCapa } from '../hooks/useUploadFotoCapa';
import { getModeloErrorMessage } from '../lib/modeloMessages';
import type { CriarModeloRequest } from '../types/modeloTypes';

type Props = {
  backPath?: string;
};

export function NovoModeloPage({ backPath }: Props) {
  const navigate = useNavigate();
  const criarModelo = useCriarModelo();
  const uploadFoto = useUploadFotoCapa();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const resolvedBackPath = backPath ?? '/app/admin/modelos';

  async function handleSubmit(payload: CriarModeloRequest, photo: File | null) {
    setErrorMessage(null);
    try {
      const created = await criarModelo.mutateAsync(payload);
      if (photo) {
        setIsUploadingPhoto(true);
        try {
          await uploadFoto.mutateAsync({ id: created.id, file: photo });
        } catch (err) {
          console.error('Erro ao enviar foto de capa do modelo:', err);
          // O modelo foi criado com sucesso, mas a foto falhou. 
          // Vamos alertar ou apenas navegar? Como o modelo foi criado, podemos navegar.
        } finally {
          setIsUploadingPhoto(false);
        }
      }
      navigate(resolvedBackPath);
    } catch (mutationError) {
      setErrorMessage(getModeloErrorMessage(mutationError));
    }
  }

  const isSubmitting = criarModelo.isPending || isUploadingPhoto;

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
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
      <div className="mt-4">
        <Link to={resolvedBackPath} className="text-sm text-slate-500 hover:underline">
          ← Voltar para modelos
        </Link>
      </div>
    </section>
  );
}
