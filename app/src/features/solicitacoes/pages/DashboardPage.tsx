import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Hourglass,
  Layers,
  Package,
  Users,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router';
import { useState, useMemo } from 'react';

import { useAuth } from '@/app/providers/authContext';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { canAccessAdmin, canManageModelos } from '@/shared/lib/permissions';
import { useMetricas } from '../hooks/useMetricas';
import { useKanbanSolicitacoes } from '../hooks/useKanbanSolicitacoes';
import { statusLabel, tipoLabel, prioridadeLabel } from '../lib/solicitacaoMessages';
import type { StatusSolicitacao, TipoSolicitacao, PrioridadeSolicitacao } from '../types/solicitacaoTypes';
import { cn } from '@/shared/lib/cn';

const STATUS_ORDER: StatusSolicitacao[] = [
  'A_FAZER',
  'EM_ANDAMENTO',
  'EM_VALIDACAO',
  'CONCLUIDA',
  'CANCELADA',
];

const STATUS_COLOR: Record<StatusSolicitacao, string> = {
  A_FAZER: 'bg-slate-400 dark:bg-slate-500',
  EM_ANDAMENTO: 'bg-sky-500 dark:bg-sky-400',
  EM_VALIDACAO: 'bg-amber-500 dark:bg-amber-400',
  CONCLUIDA: 'bg-emerald-500 dark:bg-emerald-400',
  CANCELADA: 'bg-rose-500 dark:bg-rose-400',
};

const STATUS_TEXT_COLOR: Record<StatusSolicitacao, string> = {
  A_FAZER: 'text-slate-600 dark:text-slate-400',
  EM_ANDAMENTO: 'text-sky-600 dark:text-sky-400',
  EM_VALIDACAO: 'text-amber-600 dark:text-amber-400',
  CONCLUIDA: 'text-emerald-600 dark:text-emerald-400',
  CANCELADA: 'text-rose-600 dark:text-rose-400',
};

const TIPO_ORDER: TipoSolicitacao[] = ['REPARO', 'INSPECAO', 'REENGENHARIA'];
const PRIORIDADE_ORDER: PrioridadeSolicitacao[] = ['URGENTE', 'ALTA', 'MEDIA', 'BAIXA'];

const PRIORIDADE_COLOR: Record<PrioridadeSolicitacao, string> = {
  URGENTE: 'bg-rose-500 dark:bg-rose-400',
  ALTA: 'bg-orange-500 dark:bg-orange-400',
  MEDIA: 'bg-amber-500 dark:bg-amber-400',
  BAIXA: 'bg-slate-400 dark:bg-slate-500',
};

const AGING_THRESHOLD_DAYS = 7;

function BarRow({
  label,
  count,
  max,
  barClass,
  textColor,
}: {
  label: string;
  count: number;
  max: number;
  barClass: string;
  textColor?: string;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="group flex items-center gap-3 py-1 transition-all">
      <span className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 truncate">
        {label}
      </span>
      <div className="flex-1 rounded-full bg-slate-100 dark:bg-slate-700/50" style={{ height: 8 }}>
        <div
          className={cn('h-full rounded-full transition-all duration-550 shadow-sm', barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn('w-8 text-right text-xs font-semibold tabular-nums', textColor ?? 'text-slate-700 dark:text-slate-350')}>
        {count}
      </span>
    </div>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  subtext,
  gradient,
  onClickPath,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  gradient?: 'sky' | 'purple' | 'emerald' | 'amber' | 'rose' | 'slate';
  onClickPath?: string;
}) {
  const gradientClasses = {
    sky: 'from-sky-500/10 to-blue-500/5 dark:from-sky-500/10 dark:to-blue-500/5 hover:border-sky-300 dark:hover:border-sky-600 text-sky-600 dark:text-sky-400',
    purple: 'from-purple-500/10 to-indigo-500/5 dark:from-purple-500/10 dark:to-indigo-500/5 hover:border-purple-300 dark:hover:border-purple-600 text-purple-600 dark:text-purple-400',
    emerald: 'from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/5 hover:border-emerald-300 dark:hover:border-emerald-600 text-emerald-600 dark:text-emerald-400',
    amber: 'from-amber-500/10 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/5 hover:border-amber-300 dark:hover:border-amber-600 text-amber-600 dark:text-amber-400',
    rose: 'from-rose-500/10 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/5 hover:border-rose-300 dark:hover:border-rose-600 text-rose-600 dark:text-rose-400',
    slate: 'from-slate-500/10 to-zinc-500/5 dark:from-slate-550/10 dark:to-zinc-500/5 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400',
  };

  const selectedGradient = gradient ? gradientClasses[gradient] : gradientClasses.slate;
  const isClickable = Boolean(onClickPath);

  const CardContent = (
    <div className={cn(
      "relative flex flex-col gap-2 rounded-xl border border-slate-200/85 bg-gradient-to-br p-5 shadow-sm transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-800",
      selectedGradient,
      isClickable && "hover:shadow-md cursor-pointer hover:-translate-y-0.5"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </span>
        </div>
        {isClickable && (
          <ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100 text-slate-400" />
        )}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-white">
        {value}
      </p>
      {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtext}</p>}
    </div>
  );

  if (onClickPath) {
    return (
      <Link to={onClickPath} className="group block h-full">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: metricas, isLoading: loadingMetricas, isError: errorMetricas } = useMetricas();
  const { data: solicitacoes = [], isLoading: loadingSolicitacoes, isError: errorSolicitacoes } = useKanbanSolicitacoes();
  const [now] = useState(() => Date.now());
  const isAdmin = canAccessAdmin(user?.perfil);
  const isGestor = canManageModelos(user?.perfil) && !isAdmin;

  // Agregações de Tipo e Prioridade calculadas no frontend a partir de solicitacoes
  const distributions = useMemo(() => {
    const byTipo: Record<string, number> = {};
    const byPrioridade: Record<string, number> = {};

    for (const s of solicitacoes) {
      byTipo[s.tipo] = (byTipo[s.tipo] ?? 0) + 1;
      if (s.prioridade && s.status !== 'CONCLUIDA' && s.status !== 'CANCELADA') {
        byPrioridade[s.prioridade] = (byPrioridade[s.prioridade] ?? 0) + 1;
      }
    }

    const maxTipo = Math.max(...TIPO_ORDER.map((t) => byTipo[t] ?? 0), 1);
    const maxPrio = Math.max(...PRIORIDADE_ORDER.map((p) => byPrioridade[p] ?? 0), 1);

    return { byTipo, byPrioridade, maxTipo, maxPrio };
  }, [solicitacoes]);

  if (loadingMetricas || loadingSolicitacoes) {
    return <LoadingState title="Carregando painel de indicadores..." />;
  }

  if (errorMetricas || errorSolicitacoes || !metricas) {
    return <ErrorState title="Não foi possível carregar o dashboard" description="Verifique sua conexão com o servidor." />;
  }

  // Filtragem local de aging (em atraso) das solicitações abertas
  const agingTasks = solicitacoes
    .filter((s) => {
      if (s.status === 'CONCLUIDA' || s.status === 'CANCELADA') return false;
      const dias = (now - new Date(s.criadaEm).getTime()) / 86_400_000;
      return dias > AGING_THRESHOLD_DAYS;
    })
    .map((s) => ({
      id: s.id,
      titulo: s.titulo,
      status: s.status,
      diasAberta: Math.floor((now - new Date(s.criadaEm).getTime()) / 86_400_000),
    }))
    .sort((a, b) => b.diasAberta - a.diasAberta)
    .slice(0, 5);

  const maxStatus = Math.max(
    ...STATUS_ORDER.map((status) => metricas.solicitacoesPorStatus[status] ?? 0),
    1
  );

  // Formatação do lead time médio (recebido em segundos)
  let formatSla = '—';
  const slaSegundos = metricas.tempoMedioResolucaoSegundos;
  if (slaSegundos > 0) {
    const dias = slaSegundos / 86400;
    const horas = slaSegundos / 3600;
    const minutos = slaSegundos / 60;
    if (dias >= 1) {
      formatSla = `${Math.round(dias * 10) / 10}d`;
    } else if (horas >= 1) {
      formatSla = `${Math.round(horas * 10) / 10}h`;
    } else if (minutos >= 1) {
      formatSla = `${Math.round(minutos)}m`;
    } else {
      formatSla = `${slaSegundos}s`;
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader 
          title="Dashboard" 
          description={`${metricas.totalSolicitacoes} solicitações no total`} 
        />
        <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-sky-100 bg-sky-50/50 px-3 py-1 text-xs font-semibold text-sky-800 dark:border-sky-950/40 dark:bg-sky-950/20 dark:text-sky-300">
          <Activity className="h-3.5 w-3.5 animate-pulse" />
          <span>Monitoramento em Tempo Real</span>
        </div>
      </div>

      {/* Grid de KPIs Consolidados do Sistema (Cypress testado) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPICard
          icon={Layers}
          label="Total"
          value={metricas.totalSolicitacoes}
          subtext="Chamados registrados"
          gradient="sky"
          onClickPath="/app/solicitacoes"
        />
        <KPICard
          icon={CheckCircle2}
          label="Concluídas"
          value={metricas.solicitacoesConcluidas}
          subtext={`${
            metricas.totalSolicitacoes > 0
              ? Math.round((metricas.solicitacoesConcluidas / metricas.totalSolicitacoes) * 100)
              : 0
          }% do total`}
          gradient="emerald"
        />
        <KPICard
          icon={Clock}
          label="Lead time médio"
          value={formatSla}
          subtext="abertura → conclusão"
          gradient="purple"
        />
        <KPICard
          icon={AlertTriangle}
          label="Em atraso"
          value={agingTasks.length}
          subtext="abertos há +7 dias"
          gradient={agingTasks.length > 0 ? 'rose' : 'slate'}
        />
      </div>

      {/* Grid de Cadastros — links condicionais por perfil */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard
          icon={Users}
          label="Usuários"
          value={metricas.totalUsuarios}
          subtext="Operadores, gestores e admins"
          gradient="slate"
          onClickPath={isAdmin ? '/app/admin/usuarios' : undefined}
        />
        <KPICard
          icon={Cpu}
          label="Máquinas"
          value={metricas.totalMaquinas}
          subtext="Ativos e equipamentos"
          gradient="slate"
        />
        <KPICard
          icon={Package}
          label="Modelos"
          value={metricas.totalModelos}
          subtext="Modelos e moldes"
          gradient="slate"
          onClickPath={isAdmin || isGestor ? '/app/admin/modelos' : '/app/modelos'}
        />
      </div>

      {/* Distribuições */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Distribuição por Status (Kanban Progress) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700/60">
            <div>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-250">Distribuição por status</h2>
              <p className="text-xxs text-slate-500 dark:text-slate-400">Ordens de serviço nas raias do Kanban.</p>
            </div>
            <span className="rounded bg-sky-50 px-2 py-0.5 text-xxs font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 shrink-0">
              {metricas.solicitacoesAbertas} abertas
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {STATUS_ORDER.map((status) => (
              <BarRow
                key={status}
                label={statusLabel[status]}
                count={metricas.solicitacoesPorStatus[status] ?? 0}
                max={maxStatus}
                barClass={STATUS_COLOR[status]}
                textColor={STATUS_TEXT_COLOR[status]}
              />
            ))}
          </div>
        </div>

        {/* Distribuição por Tipo & Prioridade */}
        <div className="space-y-6 lg:col-span-1">
          {/* Distribuição por Tipo */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 space-y-4">
            <div className="border-b border-slate-100 pb-2 dark:border-slate-700/60">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-250">Distribuição por tipo</h2>
              <p className="text-xxs text-slate-500 dark:text-slate-400">Classificação por categorias de chamados.</p>
            </div>
            <div className="space-y-2.5 pt-1">
              {TIPO_ORDER.map((tipo) => (
                <BarRow
                  key={tipo}
                  label={tipoLabel[tipo]}
                  count={distributions.byTipo[tipo] ?? 0}
                  max={distributions.maxTipo}
                  barClass="bg-sky-500 dark:bg-sky-400"
                />
              ))}
            </div>
          </div>

          {/* Distribuição por Prioridade */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 space-y-4">
            <div className="border-b border-slate-100 pb-2 dark:border-slate-700/60">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-250">Distribuição por prioridade</h2>
              <p className="text-xxs text-slate-500 dark:text-slate-400">Prioridades atribuídas aos chamados em andamento.</p>
            </div>
            <div className="space-y-2.5 pt-1">
              {PRIORIDADE_ORDER.map((p) => (
                <BarRow
                  key={p}
                  label={prioridadeLabel[p]}
                  count={distributions.byPrioridade[p] ?? 0}
                  max={distributions.maxPrio}
                  barClass={PRIORIDADE_COLOR[p]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Notificações Operacionais e Chamados Críticos */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-700/60">
            <Hourglass className="h-5 w-5 text-amber-500 animate-spin-slow" />
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Acompanhamento Crítico</h2>
              <p className="text-xxs text-slate-500 dark:text-slate-400">Ordens de serviço gargalando o SLA operacional.</p>
            </div>
          </div>

          {agingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Operação Saudável</p>
              <p className="text-xxs text-slate-500 dark:text-slate-400">Nenhum chamado aberto excedeu 7 dias.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {agingTasks.map((task) => (
                <li key={task.id} className="group">
                  <Link
                    to={`/app/solicitacoes/${task.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all hover:bg-sky-50/40 hover:border-sky-200 dark:border-slate-700/50 dark:bg-slate-900/30 dark:hover:bg-sky-950/20 dark:hover:border-sky-900/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-700 dark:group-hover:text-sky-400">
                        {task.titulo}
                      </p>
                      <span className={cn("inline-block mt-1 text-xxs font-medium uppercase", STATUS_TEXT_COLOR[task.status as StatusSolicitacao])}>
                        {statusLabel[task.status as StatusSolicitacao]}
                      </span>
                    </div>
                    <span className="rounded bg-rose-50 px-2 py-0.5 text-xxs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 shrink-0">
                      {task.diasAberta}d abertas
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
