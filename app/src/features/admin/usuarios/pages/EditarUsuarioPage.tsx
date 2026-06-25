import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { KeyRound, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';
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

    if (novaSenha.length < 6) {
      setSenhaErro('A nova senha deve ter no mínimo 6 caracteres.');
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

  function getPerfilLabel(perfil: PerfilUsuario) {
    const labels: Record<PerfilUsuario, string> = {
      ADMINISTRADOR: 'Administrador',
      GESTOR: 'Gestor',
      OPERADOR: 'Operador',
      EXTERNO: 'Externo',
    };
    return labels[perfil];
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
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Dados Gerais</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Nome e endereço de e-mail de acesso.</p>
          </div>
          <UsuarioForm
            mode="edit"
            usuario={usuario}
            isSubmitting={editarUsuario.isPending}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Coluna Lateral: Ações Administrativas */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card: Alterar Perfil */}
          {usuario.perfil !== 'EXTERNO' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-700/60">
                <div className="rounded-lg bg-sky-50 p-2 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400">
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">Nível de Acesso</h3>
                  <p className="text-xxs text-slate-500 dark:text-slate-400">Defina o perfil de permissão do usuário.</p>
                </div>
              </div>

              <form onSubmit={handleAlterarPerfil} className="mt-4 space-y-4">
                {perfilSucesso && (
                  <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{perfilSucesso}</span>
                  </div>
                )}

                {perfilErro && (
                  <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{perfilErro}</span>
                  </div>
                )}

                <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span>Perfil</span>
                  <select
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white disabled:opacity-50"
                    value={novoPerfil}
                    onChange={(e) => setNovoPerfil(e.target.value as PerfilUsuario)}
                    disabled={alterarPerfil.isPending || isMe}
                  >
                    {perfilOptions
                      .filter((p) => p !== 'EXTERNO') // Prestador externo cadastrado por fluxo especial
                      .map((option) => (
                        <option key={option} value={option}>
                          {getPerfilLabel(option)}
                        </option>
                      ))}
                  </select>
                </label>

                {isMe && (
                  <p className="text-xxs text-amber-600 dark:text-amber-400">
                    Você não pode alterar seu próprio nível de permissão nesta tela para evitar perda do seu acesso administrativo.
                  </p>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={alterarPerfil.isPending || isMe || novoPerfil === usuario.perfil}
                  >
                    {alterarPerfil.isPending ? 'Salvando...' : 'Alterar Perfil'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Card: Redefinir Senha */}
          {usuario.perfil !== 'EXTERNO' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-700/60">
                <div className="rounded-lg bg-sky-50 p-2 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">Redefinir Senha</h3>
                  <p className="text-xxs text-slate-500 dark:text-slate-400">Envie uma senha temporária ou nova senha.</p>
                </div>
              </div>

              <form onSubmit={handleRedefinirSenha} className="mt-4 space-y-4">
                {senhaSucesso && (
                  <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{senhaSucesso}</span>
                  </div>
                )}

                {senhaErro && (
                  <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
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
                  className="h-10 text-sm"
                  labelClassName="text-sm font-medium"
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={redefinirSenha.isPending || !novaSenha.trim()}
                  >
                    {redefinirSenha.isPending ? 'Redefinindo...' : 'Confirmar Senha'}
                  </Button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
