import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/Button/Button';

import { GaleriaModelo } from '../components/GaleriaModelo';
import { ModeloForm } from '../components/ModeloForm';
import { useCriarModelo } from '../hooks/useCriarModelo';
import { getModeloErrorMessage } from '../lib/modeloMessages';
import type { CriarModeloRequest, Modelo } from '../types/modeloTypes';

type Props = {
  backPath?: string;
};

export function NovoModeloPage({ backPath }: Props) {
  const navigate = useNavigate();
  const criarModelo = useCriarModelo();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modeloCriado, setModeloCriado] = useState<Modelo | null>(null);
  const resolvedBackPath = backPath ?? '/app/admin/modelos';

  async function handleSubmit(payload: CriarModeloRequest) {
    setErrorMessage(null);
    try {
      const created = await criarModelo.mutateAsync(payload);
      setModeloCriado(created);
    } catch (mutationError) {
      setErrorMessage(getModeloErrorMessage(mutationError));
    }
  }

  function handleIrParaDetalhe() {
    if (modeloCriado) navigate(`/app/admin/modelos/${modeloCriado.id}`);
  }

  if (modeloCriado) {
    return (
      <section>
        <PageHeader
          title="Modelo cadastrado"
          description="Adicione fotos à galeria agora, se quiser, ou siga para o detalhe do modelo."
        />
        <GaleriaModelo modeloId={modeloCriado.id} podeGerenciar />
        <div className="mt-4">
          <Button type="button" onClick={handleIrParaDetalhe}>
            Ir para o detalhe do modelo
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="Novo modelo"
        description="Cadastre um modelo de fundição. Você poderá adicionar fotos à galeria logo em seguida."
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
