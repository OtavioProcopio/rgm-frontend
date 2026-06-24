import { AlertTriangle, CheckCircle2, Clock, Layers, Package } from 'lucide-react';
import { Link } from 'react-router';

import { useModelos } from '@/features/admin/modelos/hooks/useModelos';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { cn } from '@/shared/lib/cn';

import { useDashboardData } from '../hooks/useDashboardData';
import { statusLabel, tipoLabel, prioridadeLabel } from '../lib/solicitacaoMessages';
import type { StatusSolicitacao, TipoSolicitacao, PrioridadeSolicitacao } from '../types/solicitacaoTypes';

const STATUS_ORDER: StatusSolicitacao[] = [
  'A_FAZER',
  'EM_ANDAMENTO',
  'EM_VALIDACAO',
  'CONCLUIDA',
  'CANCELADA',
];

const STATUS_COLOR: Record<StatusSolicitacao, string> = {
  A_FAZER: 'bg-slate-400',
  EM_ANDAMENTO: 'bg-sky-500',
  EM_VALIDACAO: 'bg-amber-500',
  CONCLUIDA: 'bg-emerald-500',
  CANCELADA: 'bg-red-500',
};

const TIPO_ORDER: TipoSolicitacao[] = ['REPARO', 'INSPECAO', 'REENGENHARIA'];

const PRIORIDADE_ORDER: PrioridadeSolicitacao[] = ['URGENTE', 'ALTA', 'MEDIA', 'BAIXA'];

const PRIORIDADE_COLOR: Record<PrioridadeSolicitacao, string> = {
  URGENTE: 'bg-red-500',
  ALTA: 'bg-orange-500',
  MEDIA: 'bg-amber-400',
  BAIXA: 'bg-slate-400',
};

function BarRow({
  label,
  count,
  max,
  barClass,
}: {
  label: string;
  count: number;
  max: number;
  barClass: string;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-right text-xs text-slate-600 dark:text-slate-400">
        {label}
      </span>
      <div className="flex-1 rounded-full bg-slate-100 dark:bg-slate-700" style={{ height: 10 }}>
        <div
          className={cn('h-full rounded-full transition-all', barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">
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
  highlight,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  highlight?: 'warn' | 'ok';
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex items-center gap-2">
        <Icon
          size={16}
          className={cn(
            highlight === 'warn'
              ? 'text-amber-500'
              : highlight === 'ok'
                ? 'text-emerald-500'
                : 'text-slate-400',
          )}
        />
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      <p
        className={cn(
          'text-3xl font-bold tabular-nums',
          highlight === 'warn'
            ? 'text-amber-600 dark:text-amber-400'
            : highlight === 'ok'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-900 dark:text-white',
        )}
      >
        {value}
      </p>
      {subtext && <p className="text-xs text-slate-500 dark:text-slate-400">{subtext}</p>}
    </div>
  );
}

export function DashboardPage() {
  const { metrics, isLoading, error } = useDashboardData();
  const { data: todosModelos } = useModelos({ page: 0, size: 1 });
  const { data: modelosAtivos } = useModelos({ page: 0, size: 1, ativo: true });
  const { data: modelosInativos } = useModelos({ page: 0, size: 1, ativo: false });

  if (isLoading) return <LoadingState title="Carregando métricas..." />;
  if (error)
    return <ErrorState title="Erro ao carregar métricas" description="Tente novamente." />;

  const maxStatus = Math.max(...STATUS_ORDER.map((s) => metrics.byStatus[s] ?? 0), 1);
  const maxTipo = Math.max(...TIPO_ORDER.map((t) => metrics.byTipo[t] ?? 0), 1);
  const maxPrio = Math.max(...PRIORIDADE_ORDER.map((p) => metrics.byPrioridade[p] ?? 0), 1);
  const activeCount =
    (metrics.byStatus['A_FAZER'] ?? 0) +
    (metrics.byStatus['EM_ANDAMENTO'] ?? 0) +
    (metrics.byStatus['EM_VALIDACAO'] ?? 0);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`${metrics.total} solicitações no total`}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPICard icon={Layers} label="Total" value={metrics.total} subtext="registradas" />
        <KPICard
          icon={CheckCircle2}
          label="Concluídas"
          value={metrics.concludedCount}
          subtext={`${metrics.total > 0 ? Math.round((metrics.concludedCount / metrics.total) * 100) : 0}% do total`}
          highlight="ok"
        />
        <KPICard
          icon={Clock}
          label="Lead time médio"
          value={metrics.avgLeadTimeDays !== null ? `${metrics.avgLeadTimeDays}d` : '—'}
          subtext="abertura → conclusão"
        />
        <KPICard
          icon={AlertTriangle}
          label="Em atraso"
          value={metrics.agingCount}
          subtext={`+${7}d sem conclusão`}
          highlight={metrics.agingCount > 0 ? 'warn' : undefined}
        />
      </div>

      {/* Status + Tipo row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status distribution */}
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Distribuição por status
            </h2>
            <span className="text-xs text-slate-400">{activeCount} abertas</span>
          </div>
          <div className="space-y-3">
            {STATUS_ORDER.map((status) => (
              <BarRow
                key={status}
                label={statusLabel[status]}
                count={metrics.byStatus[status] ?? 0}
                max={maxStatus}
                barClass={STATUS_COLOR[status]}
              />
            ))}
          </div>
        </div>

        {/* Tipo + Prioridade */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Distribuição por tipo
            </h2>
            <div className="space-y-3">
              {TIPO_ORDER.map((tipo) => (
                <BarRow
                  key={tipo}
                  label={tipoLabel[tipo]}
                  count={metrics.byTipo[tipo] ?? 0}
                  max={maxTipo}
                  barClass="bg-sky-500"
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Distribuição por prioridade (abertas)
            </h2>
            <div className="space-y-3">
              {PRIORIDADE_ORDER.map((p) => (
                <BarRow
                  key={p}
                  label={prioridadeLabel[p]}
                  count={metrics.byPrioridade[p] ?? 0}
                  max={maxPrio}
                  barClass={PRIORIDADE_COLOR[p]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modelos */}
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Modelos de máquinas
            </h2>
          </div>
          <Link
            to="/app/modelos"
            className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {todosModelos?.totalElements ?? '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {modelosAtivos?.totalElements ?? '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ativos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold tabular-nums text-slate-500 dark:text-slate-400">
              {modelosInativos?.totalElements ?? '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Inativos</p>
          </div>
        </div>
      </div>

      {/* Aging tasks */}
      {metrics.agingTasks.length > 0 && (
        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Solicitações em atraso (abertas há +7 dias)
            </h2>
          </div>
          <ul className="space-y-2">
            {metrics.agingTasks.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/app/solicitacoes/${t.id}`}
                  className="flex items-center justify-between gap-4 rounded-md bg-white px-3 py-2 text-sm hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/30"
                >
                  <span className="min-w-0 truncate font-medium text-slate-800 dark:text-slate-200">
                    {t.titulo}
                  </span>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{statusLabel[t.status as StatusSolicitacao]}</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      {t.diasAberta}d
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
