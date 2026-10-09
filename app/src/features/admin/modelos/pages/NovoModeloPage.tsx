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

function ModeloCadastrado({ modelo }: { modelo: Modelo }) {
  const navigate = useNavigate();

  return (
    <section>
      <PageHeader
        title="Modelo cadastrado"
        description="Adicione fotos à galeria agora, se quiser, ou siga para o detalhe do modelo."
      />
      <GaleriaModelo modeloId={modelo.id} codigo={modelo.codigo} podeGerenciar />
      <div className="mt-4">
        <Button type="button" onClick={() => navigate(`/app/admin/modelos/${modelo.id}`)}>
          Ir para o detalhe do modelo
        </Button>
      </div>
    </section>
  );
}

function ErroDeCriacao({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null;
  return (
    <div className="mb-4">
      <ErrorState title="Não foi possível criar o modelo" description={mensagem} />
    </div>
  );
}

function LinkVoltar({ para }: { para: string }) {
  return (
    <div className="mt-4">
      <Link
        to={para}
        className="inline-flex items-center text-sm text-fg-muted hover:underline pointer-coarse:min-h-11"
      >
        ← Voltar para modelos
      </Link>
    </div>
  );
}

function useCadastroDeModelo() {
  const criarModelo = useCriarModelo();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modeloCriado, setModeloCriado] = useState<Modelo | null>(null);

  async function handleSubmit(payload: CriarModeloRequest) {
    setErrorMessage(null);
    try {
      const created = await criarModelo.mutateAsync(payload);
      setModeloCriado(created);
    } catch (mutationError) {
      setErrorMessage(getModeloErrorMessage(mutationError));
    }
  }

  return { handleSubmit, errorMessage, modeloCriado, isPending: criarModelo.isPending };
}

export function NovoModeloPage({ backPath }: Props) {
  const cadastro = useCadastroDeModelo();

  if (cadastro.modeloCriado) return <ModeloCadastrado modelo={cadastro.modeloCriado} />;
  return (
    <section>
      <PageHeader
        title="Novo modelo"
        description="Cadastre um modelo de fundição. Você poderá adicionar fotos à galeria logo em seguida."
      />
      <ErroDeCriacao mensagem={cadastro.errorMessage} />
      <ModeloForm
        mode="create"
        isSubmitting={cadastro.isPending}
        onSubmit={cadastro.handleSubmit}
      />
      <LinkVoltar para={backPath ?? '/app/admin/modelos'} />
    </section>
  );
}
