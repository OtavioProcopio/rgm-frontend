import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useTiposModelo } from '@/features/admin/modelos/hooks/useTiposModelo';
import type { TipoDeModelo } from '@/features/admin/modelos/types/tipoModeloTypes';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { useToast } from '@/shared/components/Toast/toastContext';

import { TipoModeloForm } from '../components/TipoModeloForm';
import { useRenomearTipoModelo } from '../hooks/useRenomearTipoModelo';
import { getTipoModeloErrorMessage } from '../lib/tipoModeloMessages';
import type { TipoModeloFormData } from '../schemas/tipoModeloSchema';

export function EditarTipoModeloPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { avisar } = useToast();
  const { data: tiposModelo, error, isLoading, refetch } = useTiposModelo();
  const renomearTipoModelo = useRenomearTipoModelo();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tipoModelo = tiposModelo?.find((m) => m.id === id);

  async function handleSubmit(alvo: TipoDeModelo, data: TipoModeloFormData) {
    setErrorMessage(null);

    try {
      await renomearTipoModelo.mutateAsync({ id: alvo.id, payload: data });
      avisar('Tipo de modelo renomeado');
      navigate('/app/admin/tipos-modelo');
    } catch (mutationError) {
      setErrorMessage(getTipoModeloErrorMessage(mutationError));
    }
  }

  if (isLoading) {
    return <LoadingState title="Carregando tipo de modelo..." />;
  }

  if (error || !tipoModelo) {
    return (
      <ErrorState
        title="Tipo de modelo não encontrado"
        description={getTipoModeloErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <section>
      <PageHeader
        title="Renomear tipo de modelo"
        description="Atualize o nome deste tipo de modelo do catálogo."
      />

      {errorMessage ? (
        <div className="mb-4">
          <ErrorState
            title="Não foi possível renomear o tipo de modelo"
            description={errorMessage}
          />
        </div>
      ) : null}

      <TipoModeloForm
        nomeInicial={tipoModelo.nome}
        submitLabel="Salvar alterações"
        isSubmitting={renomearTipoModelo.isPending}
        onSubmit={(data) => handleSubmit(tipoModelo, data)}
      />
    </section>
  );
}
