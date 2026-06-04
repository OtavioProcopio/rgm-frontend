import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { UsuarioForm } from '../components/UsuarioForm';
import { useCriarUsuario } from '../hooks/useCriarUsuario';
import { getUsuarioErrorMessage } from '../lib/usuarioMessages';
import type { CriarUsuarioRequest } from '../types/usuarioTypes';

export function NovoUsuarioPage() {
  const navigate = useNavigate();
  const criarUsuario = useCriarUsuario();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(data: CriarUsuarioRequest) {
    setErrorMessage(null);

    try {
      await criarUsuario.mutateAsync(data);
      navigate('/app/admin/usuarios');
    } catch (error) {
      setErrorMessage(getUsuarioErrorMessage(error));
    }
  }

  return (
    <section>
      <PageHeader
        title="Novo usuário"
        description="Cadastre usuários internos ou prestadores externos do sistema."
      />

      {errorMessage ? (
        <div className="mb-4">
          <ErrorState title="Não foi possível criar o usuário" description={errorMessage} />
        </div>
      ) : null}

      <UsuarioForm mode="create" isSubmitting={criarUsuario.isPending} onSubmit={handleSubmit} />
    </section>
  );
}
