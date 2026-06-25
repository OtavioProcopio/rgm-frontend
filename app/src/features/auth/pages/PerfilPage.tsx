import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Shield, User as UserIcon, Calendar, CheckCircle2, AlertCircle, Eye, EyeOff, BarChart2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAlterarSenha } from '@/features/auth/hooks/useAlterarSenha';
import { usePerfil } from '@/features/auth/hooks/usePerfil';
import { useMetricas } from '@/features/solicitacoes/hooks/useMetricas';
import { alterarSenhaSchema, type AlterarSenhaFormData } from '@/features/auth/schemas/perfilSchema';
import { ApiError } from '@/shared/api/apiError';
import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';

export function PerfilPage() {
  const { data: usuario, isLoading, isError } = usePerfil();
  const { mutateAsync: alterarSenha } = useAlterarSenha();
  const { data: metricas } = useMetricas();

  const [sucesso, setSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarNovaSenha, setShowConfirmarNovaSenha] = useState(false);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<AlterarSenhaFormData>({
    resolver: zodResolver(alterarSenhaSchema),
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarNovaSenha: '',
    },
  });

  async function onSubmit(data: AlterarSenhaFormData) {
    setSucesso(null);
    setErro(null);

    try {
      await alterarSenha({
        senhaAtual: data.senhaAtual,
        novaSenha: data.novaSenha,
      });
      setSucesso('Senha alterada com sucesso!');
      reset();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400 || error.status === 422 || error.message.toLowerCase().includes('senha atual incorreta')) {
          setErro('Senha atual incorreta.');
          return;
        }
        setErro(error.message || 'Erro ao alterar senha.');
        return;
      }
      setErro('Não foi possível alterar a senha agora. Tente novamente mais tarde.');
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent dark:border-sky-500"></div>
      </div>
    );
  }

  if (isError || !usuario) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-slate-600 dark:text-slate-400">Não foi possível carregar as informações do perfil.</p>
      </div>
    );
  }

  // Formatando data
  const dataCriacao = usuario.criadoEm
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(usuario.criadoEm))
    : '-';

  // Iniciais do nome
  const iniciais = usuario.nome
    ? usuario.nome
        .split(' ')
        .slice(0, 2)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const badgePerfilColors: Record<string, string> = {
    ADMINISTRADOR: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50',
    GESTOR: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
    OPERADOR: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50',
    EXTERNO: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-850 dark:text-slate-300 dark:border-slate-800',
  };

  const badgeColor = badgePerfilColors[usuario.perfil] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Meu Perfil</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gerencie seus dados pessoais e de acesso.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card de Informações */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-1">
          <div className="flex flex-col items-center border-b border-slate-100 pb-6 text-center dark:border-slate-700/60">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-2xl font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 ring-4 ring-sky-100/50 dark:ring-sky-900/20">
              {iniciais}
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">{usuario.nome}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{usuario.email}</p>
            <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${badgeColor}`}>
              <Shield size={12} />
              {usuario.perfil}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <UserIcon className="h-4 w-4 text-slate-400" />
              <div>
                <p className="font-medium text-slate-500 dark:text-slate-400 text-xs">Status da Conta</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${usuario.ativo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="font-medium text-slate-500 dark:text-slate-400 text-xs">Membro desde</p>
                <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-300">{dataCriacao}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Alteração de Senha */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-5 dark:border-slate-700/60">
            <div className="rounded-lg bg-sky-50 p-2 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Alterar Senha</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Atualize sua senha de acesso periodicamente para manter sua conta segura.</p>
            </div>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {sucesso && (
              <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{sucesso}</span>
              </div>
            )}

            {erro && (
              <div className="flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{erro}</span>
              </div>
            )}

            <div className="relative">
              <Input
                label="Senha Atual"
                type={showSenhaAtual ? 'text' : 'password'}
                placeholder="Sua senha atual"
                error={errors.senhaAtual?.message}
                disabled={isSubmitting}
                {...register('senhaAtual')}
              />
              <button
                type="button"
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                onClick={() => setShowSenhaAtual(!showSenhaAtual)}
              >
                {showSenhaAtual ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Nova Senha"
                type={showNovaSenha ? 'text' : 'password'}
                placeholder="Mínimo de 6 caracteres"
                error={errors.novaSenha?.message}
                disabled={isSubmitting}
                {...register('novaSenha')}
              />
              <button
                type="button"
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                onClick={() => setShowNovaSenha(!showNovaSenha)}
              >
                {showNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirmar Nova Senha"
                type={showConfirmarNovaSenha ? 'text' : 'password'}
                placeholder="Repita a nova senha"
                error={errors.confirmarNovaSenha?.message}
                disabled={isSubmitting}
                {...register('confirmarNovaSenha')}
              />
              <button
                type="button"
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                onClick={() => setShowConfirmarNovaSenha(!showConfirmarNovaSenha)}
              >
                {showConfirmarNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end pt-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Alterando...' : 'Atualizar Senha'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {metricas && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-700/60">
            <div className="rounded-lg bg-sky-50 p-2 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400">
              <BarChart2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Visão Geral do Sistema</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resumo atualizado das atividades e registros do sistema.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-900/35">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total de Modelos</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{metricas.totalModelos}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-900/35">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total de Solicitações</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{metricas.totalSolicitacoes}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-900/35">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Em Aberto / Pendentes</p>
              <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
                {metricas.solicitacoesAbertas + metricas.solicitacoesPendentes}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-900/35">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tempo Médio de Resolução</p>
              <p className="mt-2 text-3xl font-bold text-sky-600 dark:text-sky-400">
                {metricas.tempoMedioResolucaoMinutos > 0
                  ? `${Math.round(metricas.tempoMedioResolucaoMinutos / 60)}h`
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
