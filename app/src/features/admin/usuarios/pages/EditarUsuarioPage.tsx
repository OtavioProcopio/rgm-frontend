import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

import { UsuarioForm } from '../components/UsuarioForm';
import { useEditarUsuario } from '../hooks/useEditarUsuario';
import { useUsuario } from '../hooks/useUsuario';
import { getUsuarioErrorMessage } from '../lib/usuarioMessages';
import type { EditarUsuarioRequest } from '../types/usuarioTypes';

export function EditarUsuarioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: usuario, error, isLoading } = useUsuario(id);
  const editarUsuario = useEditarUsuario();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(payload: EditarUsuarioRequest) {
    if (!id) {
      return;
    }

    setErrorMessage(null);

    try {
      await editarUsuario.mutateAsync({ id, payload });
      navigate('/app/admin/usuarios');
    } catch (mutationError) {
      setErrorMessage(getUsuarioErrorMessage(mutationError));
    }
  }

  return (
    <section>
      <PageHeader
        title="Editar usuário"
        description="Atualize dados básicos. Alteração de senha ainda não está disponível."
      />

      {isLoading ? <LoadingState title="Carregando usuário..." /> : null}

      {error ? (
        <ErrorState title="Usuário não encontrado" description={getUsuarioErrorMessage(error)} />
      ) : null}

      {errorMessage ? (
        <div className="mb-4">
          <ErrorState title="Não foi possível editar o usuário" description={errorMessage} />
        </div>
      ) : null}

      {usuario ? (
        <UsuarioForm
          mode="edit"
          usuario={usuario}
          isSubmitting={editarUsuario.isPending}
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  );
}
