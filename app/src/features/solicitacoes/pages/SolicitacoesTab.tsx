import { AlertTriangle, CheckCircle2, Clock, Hourglass, Layers, Package, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { cn } from '@/shared/lib/cn';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { solicitacoesKeys } from '../hooks/solicitacoesKeys';
import { statusLabel, tipoLabel, prioridadeLabel } from '../lib/solicitacaoMessages';
import type {
  MetricasResponse,
  PrioridadeSolicitacao,
  SolicitacoesFilters,
  StatusSolicitacao,
  TipoSolicitacao,
} from '../types/solicitacaoTypes';
import { KPICard } from './DashboardKpiCard';

function useSolicitacoesTotal(filters: SolicitacoesFilters) {
  return useQuery({
    queryKey: solicitacoesKeys.list(filters),
    queryFn: () => solicitacoesApi.listar(filters),
    select: (data) => data.totalElements,
  });
}

function useSolicitacoesPorStatusAberto(status: StatusSolicitacao) {
  return useQuery({
    queryKey: solicitacoesKeys.list({ status, page: 0, size: 1000 }),
    queryFn: () => solicitacoesApi.listar({ status, page: 0, size: 1000 }),
    select: (data) => data.content,
  });
}

/**
 * Distribuicao por tipo/prioridade e lista de atrasadas usando contagens reais do backend
 * (nao um array capado no cliente) — ver bug do dashboard "dados irreais": distribuicoes
 * calculadas a partir de uma pagina fixa de 200 registros ficavam incorretas assim que o
 * total de solicitacoes passava disso.
 */
function useDistribuicoes() {
  const [now] = useState(() => Date.now());

  const reparo = useSolicitacoesTotal({ tipo: 'REPARO', page: 0, size: 1 });
  const inspecao = useSolicitacoesTotal({ tipo: 'INSPECAO', page: 0, size: 1 });
  const reengenharia = useSolicitacoesTotal({ tipo: 'REENGENHARIA', page: 0, size: 1 });
  const criacao = useSolicitacoesTotal({ tipo: 'CRIACAO', page: 0, size: 1 });
  const byTipo: Record<string, number> = {
    REPARO: reparo.data ?? 0,
    INSPECAO: inspecao.data ?? 0,
    REENGENHARIA: reengenharia.data ?? 0,
    CRIACAO: criacao.data ?? 0,
  };

  const aFazer = useSolicitacoesPorStatusAberto('A_FAZER');
  const emAndamento = useSolicitacoesPorStatusAberto('EM_ANDAMENTO');
  const emValidacao = useSolicitacoesPorStatusAberto('EM_VALIDACAO');

  const byPrioridade: Record<string, number> = {};
  for (const status of [aFazer, emAndamento, emValidacao]) {
    for (const s of status.data ?? []) {
      if (s.prioridade) {
        byPrioridade[s.prioridade] = (byPrioridade[s.prioridade] ?? 0) + 1;
      }
    }
  }

  const atrasadasCount = useSolicitacoesTotal({ atrasada: true, page: 0, size: 1 });
  const atrasadasLista = useQuery({
    queryKey: solicitacoesKeys.list({ atrasada: true, page: 0, size: 5 }),
    queryFn: () => solicitacoesApi.listar({ atrasada: true, page: 0, size: 5 }),
    select: (data) => data.content,
  });

  const maxTipo = Math.max(...TIPO_ORDER.map((t) => byTipo[t] ?? 0), 1);
  const maxPrio = Math.max(...PRIORIDADE_ORDER.map((p) => byPrioridade[p] ?? 0), 1);

  const agingTasks = (atrasadasLista.data ?? []).map((s) => ({
    id: s.id,
    titulo: s.titulo,
    status: s.status,
    diasAberta: Math.floor((now - new Date(s.criadaEm).getTime()) / 86_400_000),
  }));

  return {
    byTipo,
    byPrioridade,
    maxTipo,
    maxPrio,
    agingCount: atrasadasCount.data ?? 0,
    agingTasks,
  };
}

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

const TIPO_ORDER: TipoSolicitacao[] = ['REPARO', 'INSPECAO', 'REENGENHARIA', 'CRIACAO'];
const PRIORIDADE_ORDER: PrioridadeSolicitacao[] = ['URGENTE', 'ALTA', 'MEDIA', 'BAIXA'];

const PRIORIDADE_COLOR: Record<PrioridadeSolicitacao, string> = {
  URGENTE: 'bg-rose-500 dark:bg-rose-400',
  ALTA: 'bg-orange-500 dark:bg-orange-400',
  MEDIA: 'bg-amber-500 dark:bg-amber-400',
  BAIXA: 'bg-slate-400 dark:bg-slate-500',
};

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
      <span
        className={cn(
          'w-8 text-right text-xs font-semibold tabular-nums',
          textColor ?? 'text-slate-700 dark:text-slate-350',
        )}
      >
        {count}
      </span>
    </div>
  );
}

type Props = {
  metricas: MetricasResponse;
  isAdmin: boolean;
  isGestor: boolean;
};

export function SolicitacoesTab({ metricas, isAdmin, isGestor }: Props) {
  const distributions = useDistribuicoes();
  const { agingCount, agingTasks } = distributions;

  const maxStatus = Math.max(
    ...STATUS_ORDER.map((status) => metricas.solicitacoesPorStatus[status] ?? 0),
    1,
  );

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
    <div className="space-y-6">
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
          value={agingCount}
          subtext="abertos há +7 dias"
          gradient={agingCount > 0 ? 'rose' : 'slate'}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <KPICard
          icon={Users}
          label="Usuários"
          value={metricas.totalUsuarios}
          subtext="Operadores, gestores e admins"
          gradient="slate"
          onClickPath={isAdmin ? '/app/admin/usuarios' : undefined}
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

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Distribuição detalhada por status
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">
                  Qtd.
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">
                  %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {STATUS_ORDER.map((status) => {
                const count = metricas.solicitacoesPorStatus[status] ?? 0;
                const pct =
                  metricas.totalSolicitacoes > 0
                    ? ((count / metricas.totalSolicitacoes) * 100).toFixed(1)
                    : '0.0';
                return (
                  <tr key={status} className="bg-white dark:bg-slate-800/50">
                    <td className={cn('px-4 py-3 font-medium', STATUS_TEXT_COLOR[status])}>
                      {statusLabel[status]}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {count}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-500 dark:text-slate-400">
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700/60">
            <div>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-250">
                Distribuição por status
              </h2>
              <p className="text-xxs text-slate-500 dark:text-slate-400">
                Ordens de serviço nas raias do Kanban.
              </p>
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

        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 space-y-4">
            <div className="border-b border-slate-100 pb-2 dark:border-slate-700/60">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-250">
                Distribuição por tipo
              </h2>
              <p className="text-xxs text-slate-500 dark:text-slate-400">
                Classificação por categorias de chamados.
              </p>
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

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 space-y-4">
            <div className="border-b border-slate-100 pb-2 dark:border-slate-700/60">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-250">
                Distribuição por prioridade
              </h2>
              <p className="text-xxs text-slate-500 dark:text-slate-400">
                Prioridades atribuídas aos chamados em andamento.
              </p>
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

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-700/60">
            <Hourglass className="h-5 w-5 text-amber-500 animate-spin-slow" />
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Acompanhamento Crítico</h2>
              <p className="text-xxs text-slate-500 dark:text-slate-400">
                Ordens de serviço gargalando o SLA operacional.
              </p>
            </div>
          </div>

          {agingCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Operação Saudável
              </p>
              <p className="text-xxs text-slate-500 dark:text-slate-400">
                Nenhum chamado aberto excedeu 7 dias.
              </p>
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
                      <span
                        className={cn(
                          'inline-block mt-1 text-xxs font-medium uppercase',
                          STATUS_TEXT_COLOR[task.status],
                        )}
                      >
                        {statusLabel[task.status]}
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
    </div>
  );
}
