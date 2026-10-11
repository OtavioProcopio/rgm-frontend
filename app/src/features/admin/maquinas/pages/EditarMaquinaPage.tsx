import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useMaquinas } from '@/features/admin/modelos/hooks/useMaquinas';
import type { Maquina } from '@/features/admin/modelos/types/maquinaTypes';
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
  const { data: maquinas, error, isLoading, refetch } = useMaquinas();
  const renomearMaquina = useRenomearMaquina();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const maquina = maquinas?.find((m) => m.id === id);

  async function handleSubmit(alvo: Maquina, data: MaquinaFormData) {
    setErrorMessage(null);

    try {
      await renomearMaquina.mutateAsync({ id: alvo.id, payload: data });
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
      <ErrorState
        title="Máquina não encontrada"
        description={getMaquinaErrorMessage(error)}
        onRetry={() => void refetch()}
      />
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
        onSubmit={(data) => handleSubmit(maquina, data)}
      />
    </section>
  );
}
