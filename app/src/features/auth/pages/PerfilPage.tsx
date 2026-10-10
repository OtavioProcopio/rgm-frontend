import { zodResolver } from '@hookform/resolvers/zod';
import {
  KeyRound,
  Shield,
  User as UserIcon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  BarChart2,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAlterarSenha } from '@/features/auth/hooks/useAlterarSenha';
import { usePerfil } from '@/features/auth/hooks/usePerfil';
import { useMetricas } from '@/features/solicitacoes/hooks/useMetricas';
import {
  alterarSenhaSchema,
  type AlterarSenhaFormData,
} from '@/features/auth/schemas/perfilSchema';
import { TAMANHO_MINIMO_DA_SENHA } from '@/shared/lib/senha';
import type { PerfilUsuario } from '@/features/auth/types/authTypes';
import { ApiError } from '@/shared/api/apiError';
import { Badge, type BadgeVariant } from '@/shared/components/Badge/Badge';
import { Button } from '@/shared/components/Button/Button';
import { Card } from '@/shared/components/Card/Card';
import { Input } from '@/shared/components/Input/Input';
import { rotuloDoPerfil } from '@/shared/lib/rotulos';

const VARIACAO_DO_PERFIL: Record<PerfilUsuario, BadgeVariant> = {
  ADMINISTRADOR: 'accent',
  GESTOR: 'info',
  OPERADOR: 'neutral',
  EXTERNO: 'success',
};

export function PerfilPage() {
  const { data: usuario, isLoading, isError } = usePerfil();
  const { mutateAsync: alterarSenha } = useAlterarSenha();
  // OPERADOR nao recebe indicadores agregados do sistema (a API responde 403).
  const veIndicadoresDoSistema =
    usuario?.perfil === 'GESTOR' || usuario?.perfil === 'ADMINISTRADOR';
  const { data: metricas } = useMetricas({ enabled: veIndicadoresDoSistema });

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
        if (
          error.status === 400 ||
          error.status === 422 ||
          error.message.toLowerCase().includes('senha atual incorreta')
        ) {
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  if (isError || !usuario) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-10 w-10 text-danger-fg" />
        <p className="text-fg-muted">Não foi possível carregar as informações do perfil.</p>
      </div>
    );
  }

  // Formatando data
  const dataCriacao = usuario.criadoEm
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(
        new Date(usuario.criadoEm),
      )
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">Meu Perfil</h1>
        <p className="text-sm text-fg-muted">Gerencie seus dados pessoais e de acesso.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card de Informações */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center border-b border-line pb-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted text-2xl font-semibold text-accent ring-4 ring-line">
              {iniciais}
            </div>
            <h2 className="mt-4 text-lg font-bold text-fg">{usuario.nome}</h2>
            <p className="text-sm text-fg-muted">{usuario.email}</p>
            <Badge
              variant={VARIACAO_DO_PERFIL[usuario.perfil]}
              icon={<Shield size={12} />}
              className="mt-3 gap-1.5 border border-transparent font-semibold"
            >
              {rotuloDoPerfil[usuario.perfil]}
            </Badge>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <UserIcon className="h-4 w-4 text-fg-muted" />
              <div>
                <p className="font-medium text-fg-muted text-xs">Status da Conta</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${usuario.ativo ? 'bg-success' : 'bg-fg-muted'}`}
                  />
                  <span className="font-semibold text-fg-muted">
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-fg-muted" />
              <div>
                <p className="font-medium text-fg-muted text-xs">Membro desde</p>
                <p className="mt-0.5 font-semibold text-fg-muted">{dataCriacao}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Formulário de Alteração de Senha */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-line pb-5">
            <div className="rounded-lg bg-surface-muted p-2 text-accent">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-fg">Alterar Senha</h2>
              <p className="text-xs text-fg-muted">
                Atualize sua senha de acesso periodicamente para manter sua conta segura.
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {sucesso && (
              <div className="flex items-center gap-2.5 rounded-lg border border-success bg-success-soft px-4 py-3 text-sm text-success-fg">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>{sucesso}</span>
              </div>
            )}

            {erro && (
              <div className="flex items-center gap-2.5 rounded-lg border border-danger bg-danger-soft px-4 py-3 text-sm text-danger-fg">
                <AlertCircle className="h-5 w-5 shrink-0" />
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
                className="pr-11"
                {...register('senhaAtual')}
              />
              <button
                type="button"
                aria-label={showSenhaAtual ? 'Ocultar a senha atual' : 'Mostrar a senha atual'}
                aria-pressed={showSenhaAtual}
                className="absolute right-0 top-7 inline-flex h-11 w-11 items-center justify-center rounded-md text-fg-muted hover:text-fg"
                onClick={() => setShowSenhaAtual(!showSenhaAtual)}
              >
                {showSenhaAtual ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Nova Senha"
                type={showNovaSenha ? 'text' : 'password'}
                placeholder={`Mínimo de ${TAMANHO_MINIMO_DA_SENHA} caracteres`}
                error={errors.novaSenha?.message}
                disabled={isSubmitting}
                className="pr-11"
                {...register('novaSenha')}
              />
              <button
                type="button"
                aria-label={showNovaSenha ? 'Ocultar a nova senha' : 'Mostrar a nova senha'}
                aria-pressed={showNovaSenha}
                className="absolute right-0 top-7 inline-flex h-11 w-11 items-center justify-center rounded-md text-fg-muted hover:text-fg"
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
                className="pr-11"
                {...register('confirmarNovaSenha')}
              />
              <button
                type="button"
                aria-label={
                  showConfirmarNovaSenha
                    ? 'Ocultar a confirmação da nova senha'
                    : 'Mostrar a confirmação da nova senha'
                }
                aria-pressed={showConfirmarNovaSenha}
                className="absolute right-0 top-7 inline-flex h-11 w-11 items-center justify-center rounded-md text-fg-muted hover:text-fg"
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
        </Card>
      </div>

      {veIndicadoresDoSistema && metricas && (
        <Card className="p-6">
          <div className="flex items-center gap-2.5 border-b border-line pb-4">
            <div className="rounded-lg bg-surface-muted p-2 text-accent">
              <BarChart2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-fg">Visão Geral do Sistema</h2>
              <p className="text-xs text-fg-muted">
                Resumo atualizado das atividades e registros do sistema.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-line bg-surface-muted p-4">
              <p className="text-xs font-medium text-fg-muted">Total de Modelos</p>
              <p className="mt-2 text-3xl font-bold text-fg">{metricas.totalModelos}</p>
            </div>
            <div className="rounded-lg border border-line bg-surface-muted p-4">
              <p className="text-xs font-medium text-fg-muted">Total de Solicitações</p>
              <p className="mt-2 text-3xl font-bold text-fg">{metricas.totalSolicitacoes}</p>
            </div>
            <div className="rounded-lg border border-line bg-surface-muted p-4">
              <p className="text-xs font-medium text-fg-muted">Em Aberto / Pendentes</p>
              <p className="mt-2 text-3xl font-bold text-warning-fg">
                {metricas.solicitacoesAbertas + metricas.solicitacoesPendentes}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-surface-muted p-4">
              <p className="text-xs font-medium text-fg-muted">Tempo Médio de Resolução</p>
              <p className="mt-2 text-3xl font-bold text-accent">
                {metricas.tempoMedioResolucaoSegundos > 0
                  ? `${Math.round(metricas.tempoMedioResolucaoSegundos / 3600)}h`
                  : '—'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
