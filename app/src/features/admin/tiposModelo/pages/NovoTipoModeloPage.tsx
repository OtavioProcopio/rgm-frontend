import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { useToast } from '@/shared/components/Toast/toastContext';

import { TipoModeloForm } from '../components/TipoModeloForm';
import { useCriarTipoModelo } from '../hooks/useCriarTipoModelo';
import { getTipoModeloErrorMessage } from '../lib/tipoModeloMessages';
import type { TipoModeloFormData } from '../schemas/tipoModeloSchema';

export function NovoTipoModeloPage() {
  const navigate = useNavigate();
  const { avisar } = useToast();
  const criarTipoModelo = useCriarTipoModelo();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(data: TipoModeloFormData) {
    setErrorMessage(null);

    try {
      await criarTipoModelo.mutateAsync(data);
      avisar('Tipo de modelo cadastrado');
      navigate('/app/admin/tipos-modelo');
    } catch (error) {
      setErrorMessage(getTipoModeloErrorMessage(error));
    }
  }

  return (
    <section>
      <PageHeader
        title="Novo tipo de modelo"
        description="Cadastre um tipo de modelo no catálogo usado pelos modelos."
      />

      {errorMessage ? (
        <div className="mb-4">
          <ErrorState title="Não foi possível criar o tipo de modelo" description={errorMessage} />
        </div>
      ) : null}

      <TipoModeloForm
        submitLabel="Salvar tipo de modelo"
        isSubmitting={criarTipoModelo.isPending}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
