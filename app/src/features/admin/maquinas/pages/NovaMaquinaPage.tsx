import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { MaquinaForm } from '../components/MaquinaForm';
import { useCriarMaquina } from '../hooks/useCriarMaquina';
import { getMaquinaErrorMessage } from '../lib/maquinaMessages';
import type { MaquinaFormData } from '../schemas/maquinaSchema';

export function NovaMaquinaPage() {
  const navigate = useNavigate();
  const criarMaquina = useCriarMaquina();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(data: MaquinaFormData) {
    setErrorMessage(null);

    try {
      await criarMaquina.mutateAsync(data);
      navigate('/app/admin/maquinas');
    } catch (error) {
      setErrorMessage(getMaquinaErrorMessage(error));
    }
  }

  return (
    <section>
      <PageHeader
        title="Nova máquina"
        description="Cadastre uma máquina/encaixe no catálogo usado pelos modelos."
      />

      {errorMessage ? (
        <div className="mb-4">
          <ErrorState title="Não foi possível criar a máquina" description={errorMessage} />
        </div>
      ) : null}

      <MaquinaForm
        submitLabel="Salvar máquina"
        isSubmitting={criarMaquina.isPending}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
