import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { KeyRound, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';
import { Card } from '@/shared/components/Card/Card';
import { rotuloDoPerfil } from '@/shared/lib/rotulos';
import { erroDaSenha } from '@/shared/lib/senha';
import { usePerfil } from '@/features/auth/hooks/usePerfil';

import { UsuarioForm } from '../components/UsuarioForm';
import { useEditarUsuario } from '../hooks/useEditarUsuario';
import { useUsuario } from '../hooks/useUsuario';
import { useRedefinirSenhaUsuario } from '../hooks/useRedefinirSenhaUsuario';
import { useAlterarPerfilUsuario } from '../hooks/useAlterarPerfilUsuario';
import { getUsuarioErrorMessage } from '../lib/usuarioMessages';
import type { EditarUsuarioRequest, PerfilUsuario } from '../types/usuarioTypes';

const perfilOptions: PerfilUsuario[] = ['ADMINISTRADOR', 'GESTOR', 'OPERADOR', 'EXTERNO'];

export function EditarUsuarioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: usuario, error, isLoading } = useUsuario(id);
  const { data: currentUser } = usePerfil();

  const editarUsuario = useEditarUsuario();
  const redefinirSenha = useRedefinirSenhaUsuario();
  const alterarPerfil = useAlterarPerfilUsuario();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // States para Redefinição de Senha
  const [novaSenha, setNovaSenha] = useState('');
  const [senhaSucesso, setSenhaSucesso] = useState<string | null>(null);
  const [senhaErro, setSenhaErro] = useState<string | null>(null);

  // States para Redefinição de Perfil
  const [novoPerfil, setNovoPerfil] = useState<PerfilUsuario | ''>('');
  const [perfilSucesso, setPerfilSucesso] = useState<string | null>(null);
  const [perfilErro, setPerfilErro] = useState<string | null>(null);

  const isMe = usuario?.id === currentUser?.id;

  useEffect(() => {
    if (usuario) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNovoPerfil(usuario.perfil);
    }
  }, [usuario]);

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

  async function handleRedefinirSenha(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !novaSenha.trim()) return;

    const erroDaNovaSenha = erroDaSenha(novaSenha);
    if (erroDaNovaSenha) {
      setSenhaErro(erroDaNovaSenha);
      return;
    }

    setSenhaSucesso(null);
    setSenhaErro(null);

    try {
      await redefinirSenha.mutateAsync({ id, novaSenha });
      setSenhaSucesso('Senha redefinida com sucesso!');
      setNovaSenha('');
    } catch (err) {
      setSenhaErro(getUsuarioErrorMessage(err));
    }
  }

  async function handleAlterarPerfil(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !novoPerfil) return;

    setPerfilSucesso(null);
    setPerfilErro(null);

    try {
      await alterarPerfil.mutateAsync({ id, perfil: novoPerfil });
      setPerfilSucesso('Perfil de usuário atualizado com sucesso!');
    } catch (err) {
      setPerfilErro(getUsuarioErrorMessage(err));
    }
  }

  if (isLoading) {
    return <LoadingState title="Carregando usuário..." />;
  }

  if (error || !usuario) {
    return (
      <ErrorState title="Usuário não encontrado" description={getUsuarioErrorMessage(error)} />
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Editar usuário"
        description="Gerencie as informações básicas, nível de acesso e segurança do usuário."
      />

      {errorMessage ? (
        <div className="mb-4">
          <ErrorState title="Não foi possível editar o usuário" description={errorMessage} />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna Principal: Formulário Básico */}
        <Card className="p-6 lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-fg">Dados Gerais</h2>
            <p className="text-xs text-fg-muted">Nome e endereço de e-mail de acesso.</p>
          </div>
          <UsuarioForm
            mode="edit"
            usuario={usuario}
            isSubmitting={editarUsuario.isPending}
            onSubmit={handleSubmit}
          />
        </Card>

        {/* Coluna Lateral: Ações Administrativas */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card: Alterar Perfil */}
          {usuario.perfil !== 'EXTERNO' && (
            <Card className="p-6">
              <div className="flex items-center gap-2.5 border-b border-line pb-4">
                <div className="rounded-lg bg-info-soft p-2 text-info-fg">
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-fg">Nível de Acesso</h3>
                  <p className="text-xxs text-fg-muted">Defina o perfil de permissão do usuário.</p>
                </div>
              </div>

              <form onSubmit={handleAlterarPerfil} className="mt-4 space-y-4">
                {perfilSucesso && (
                  <div className="flex items-center gap-2 rounded-md border border-success bg-success-soft px-3 py-2 text-xs text-success-fg">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success-fg" />
                    <span>{perfilSucesso}</span>
                  </div>
                )}

                {perfilErro && (
                  <div className="flex items-center gap-2 rounded-md border border-danger bg-danger-soft px-3 py-2 text-xs text-danger-fg">
                    <AlertCircle className="h-4 w-4 shrink-0 text-danger-fg" />
                    <span>{perfilErro}</span>
                  </div>
                )}

                <label className="block space-y-2 text-sm font-medium text-fg">
                  <span>Perfil</span>
                  <select
                    className="h-10 w-full rounded-md border pointer-coarse:h-11 border-line-strong bg-surface px-3 text-sm text-fg disabled:opacity-50"
                    value={novoPerfil}
                    onChange={(e) => setNovoPerfil(e.target.value as PerfilUsuario)}
                    disabled={alterarPerfil.isPending || isMe}
                  >
                    {perfilOptions
                      .filter((p) => p !== 'EXTERNO') // Prestador externo cadastrado por fluxo especial
                      .map((option) => (
                        <option key={option} value={option}>
                          {rotuloDoPerfil[option]}
                        </option>
                      ))}
                  </select>
                </label>

                {isMe && (
                  <p className="text-xxs text-warning-fg">
                    Você não pode alterar seu próprio nível de permissão nesta tela para evitar
                    perda do seu acesso administrativo.
                  </p>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={alterarPerfil.isPending || isMe || novoPerfil === usuario.perfil}
                  >
                    {alterarPerfil.isPending ? 'Salvando...' : 'Alterar Perfil'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Card: Redefinir Senha */}
          {usuario.perfil !== 'EXTERNO' && (
            <Card className="p-6">
              <div className="flex items-center gap-2.5 border-b border-line pb-4">
                <div className="rounded-lg bg-info-soft p-2 text-info-fg">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-fg">Redefinir Senha</h3>
                  <p className="text-xxs text-fg-muted">
                    Envie uma senha temporária ou nova senha.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRedefinirSenha} className="mt-4 space-y-4">
                {senhaSucesso && (
                  <div className="flex items-center gap-2 rounded-md border border-success bg-success-soft px-3 py-2 text-xs text-success-fg">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success-fg" />
                    <span>{senhaSucesso}</span>
                  </div>
                )}

                {senhaErro && (
                  <div className="flex items-center gap-2 rounded-md border border-danger bg-danger-soft px-3 py-2 text-xs text-danger-fg">
                    <AlertCircle className="h-4 w-4 shrink-0 text-danger-fg" />
                    <span>{senhaErro}</span>
                  </div>
                )}

                <Input
                  label="Nova Senha"
                  type="password"
                  placeholder="Nova senha temporária"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  disabled={redefinirSenha.isPending}
                  className="h-10 text-sm pointer-coarse:h-11"
                  labelClassName="text-sm font-medium"
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={redefinirSenha.isPending || !novaSenha.trim()}>
                    {redefinirSenha.isPending ? 'Redefinindo...' : 'Confirmar Senha'}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
