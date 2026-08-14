import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useMaquinas } from '@/features/admin/modelos/hooks/useMaquinas';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { MaquinaForm } from '../components/MaquinaForm';
import { useRenomearMaquina } from '../hooks/useRenomearMaquina';
import { getMaquinaErrorMessage } from '../lib/maquinaMessages';
import type { MaquinaFormData } from '../schemas/maquinaSchema';

export function EditarMaquinaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: maquinas, error, isLoading } = useMaquinas();
  const renomearMaquina = useRenomearMaquina();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const maquina = maquinas?.find((m) => m.id === id);

  async function handleSubmit(data: MaquinaFormData) {
    if (!id) return;

    setErrorMessage(null);

    try {
      await renomearMaquina.mutateAsync({ id, payload: data });
      navigate('/app/admin/maquinas');
    } catch (mutationError) {
      setErrorMessage(getMaquinaErrorMessage(mutationError));
    }
  }

  if (isLoading) {
    return <LoadingState title="Carregando máquina..." />;
  }

  if (error || !maquina) {
    return (
      <ErrorState title="Máquina não encontrada" description={getMaquinaErrorMessage(error)} />
    );
  }

  return (
    <section>
      <PageHeader title="Renomear máquina" description="Atualize o nome desta máquina do catálogo." />

      {errorMessage ? (
        <div className="mb-4">
          <ErrorState title="Não foi possível renomear a máquina" description={errorMessage} />
        </div>
      ) : null}

      <MaquinaForm
        nomeInicial={maquina.nome}
        submitLabel="Salvar alterações"
        isSubmitting={renomearMaquina.isPending}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
