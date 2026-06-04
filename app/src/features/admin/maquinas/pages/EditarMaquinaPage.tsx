import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { MaquinaForm } from '../components/MaquinaForm';
import { useEditarMaquina } from '../hooks/useEditarMaquina';
import { useMaquina } from '../hooks/useMaquina';
import { getMaquinaErrorMessage } from '../lib/maquinaMessages';
import type { EditarMaquinaRequest } from '../types/maquinaTypes';

export function EditarMaquinaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: maquina, error, isLoading } = useMaquina(id);
  const editarMaquina = useEditarMaquina();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(payload: EditarMaquinaRequest) {
    if (!id) {
      return;
    }

    setErrorMessage(null);

    try {
      await editarMaquina.mutateAsync({ id, payload });
      navigate('/app/admin/maquinas');
    } catch (mutationError) {
      setErrorMessage(getMaquinaErrorMessage(mutationError));
    }
  }

  return (
    <section>
      <PageHeader title="Editar máquina" description="Atualize os dados da máquina." />
      {isLoading ? <LoadingState title="Carregando máquina..." /> : null}
      {error ? (
        <ErrorState title="Máquina não encontrada" description={getMaquinaErrorMessage(error)} />
      ) : null}
      {errorMessage ? (
        <div className="mb-4">
          <ErrorState title="Não foi possível editar a máquina" description={errorMessage} />
        </div>
      ) : null}
      {maquina ? (
        <MaquinaForm
          initialValues={maquina}
          isSubmitting={editarMaquina.isPending}
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  );
}
