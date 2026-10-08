import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Hourglass,
  Layers,
  Package,
  Users,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { Badge } from '@/shared/components/Badge/Badge';
import { Card } from '@/shared/components/Card/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/components/Table/Table';
import { cn } from '@/shared/lib/cn';
import {
  rotuloDaPrioridade,
  rotuloDoStatus,
  rotuloDoTipoDeSolicitacao,
} from '@/shared/lib/rotulos';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { solicitacoesKeys } from '../hooks/solicitacoesKeys';
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

  // Uma contagem por prioridade, só entre as solicitações em aberto.
  const urgente = useSolicitacoesTotal({ emAberto: true, prioridade: 'URGENTE', page: 0, size: 1 });
  const alta = useSolicitacoesTotal({ emAberto: true, prioridade: 'ALTA', page: 0, size: 1 });
  const media = useSolicitacoesTotal({ emAberto: true, prioridade: 'MEDIA', page: 0, size: 1 });
  const baixa = useSolicitacoesTotal({ emAberto: true, prioridade: 'BAIXA', page: 0, size: 1 });
  const byPrioridade: Record<string, number> = {
    URGENTE: urgente.data ?? 0,
    ALTA: alta.data ?? 0,
    MEDIA: media.data ?? 0,
    BAIXA: baixa.data ?? 0,
  };

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
  A_FAZER: 'bg-fg-muted',
  EM_ANDAMENTO: 'bg-info',
  EM_VALIDACAO: 'bg-warning',
  CONCLUIDA: 'bg-success',
  CANCELADA: 'bg-danger',
};

const STATUS_TEXT_COLOR: Record<StatusSolicitacao, string> = {
  A_FAZER: 'text-fg-muted',
  EM_ANDAMENTO: 'text-info-fg',
  EM_VALIDACAO: 'text-warning-fg',
  CONCLUIDA: 'text-success-fg',
  CANCELADA: 'text-danger-fg',
};

const TIPO_ORDER: TipoSolicitacao[] = ['REPARO', 'INSPECAO', 'REENGENHARIA', 'CRIACAO'];
const PRIORIDADE_ORDER: PrioridadeSolicitacao[] = ['URGENTE', 'ALTA', 'MEDIA', 'BAIXA'];

const PRIORIDADE_COLOR: Record<PrioridadeSolicitacao, string> = {
  URGENTE: 'bg-danger',
  ALTA: 'bg-warning',
  MEDIA: 'bg-info',
  BAIXA: 'bg-fg-muted',
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
      <span className="w-24 shrink-0 text-right text-xs font-medium text-fg-muted group-hover:text-fg truncate">
        {label}
      </span>
      <div className="flex-1 rounded-full bg-surface-muted" style={{ height: 8 }}>
        <div
          className={cn('h-full rounded-full transition-all duration-550 shadow-sm', barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          'w-8 text-right text-xs font-semibold tabular-nums',
          textColor ?? 'text-fg-muted',
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
          subtext="fora do prazo de SLA"
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

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-fg-muted">
          Distribuição detalhada por status
        </h2>
        <Table className="rounded-lg">
          <TableHead className="[&_th]:py-3.5">
            <TableRow>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Qtd.</TableHeaderCell>
              <TableHeaderCell className="text-right">%</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {STATUS_ORDER.map((status) => {
              const count = metricas.solicitacoesPorStatus[status] ?? 0;
              const pct =
                metricas.totalSolicitacoes > 0
                  ? ((count / metricas.totalSolicitacoes) * 100).toFixed(1)
                  : '0.0';
              return (
                <TableRow key={status}>
                  <TableCell className={cn('font-medium', STATUS_TEXT_COLOR[status])}>
                    {rotuloDoStatus[status]}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-fg-muted">{count}</TableCell>
                  <TableCell className="text-right tabular-nums text-fg-muted">{pct}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h2 className="text-sm font-semibold text-fg-muted">Distribuição por status</h2>
              <p className="text-xxs text-fg-muted">Ordens de serviço nas raias do Kanban.</p>
            </div>
            <Badge className="rounded px-2 text-base font-bold shrink-0">
              {metricas.solicitacoesAbertas} abertas
            </Badge>
          </div>

          <div className="space-y-2.5 pt-1">
            {STATUS_ORDER.map((status) => (
              <BarRow
                key={status}
                label={rotuloDoStatus[status]}
                count={metricas.solicitacoesPorStatus[status] ?? 0}
                max={maxStatus}
                barClass={STATUS_COLOR[status]}
                textColor={STATUS_TEXT_COLOR[status]}
              />
            ))}
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-1">
          <Card className="p-5 space-y-4">
            <div className="border-b border-line pb-2">
              <h2 className="text-sm font-semibold text-fg-muted">Distribuição por tipo</h2>
              <p className="text-xxs text-fg-muted">Classificação por categorias de chamados.</p>
            </div>
            <div className="space-y-2.5 pt-1">
              {TIPO_ORDER.map((tipo) => (
                <BarRow
                  key={tipo}
                  label={rotuloDoTipoDeSolicitacao[tipo]}
                  count={distributions.byTipo[tipo] ?? 0}
                  max={distributions.maxTipo}
                  barClass="bg-accent"
                />
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <div className="border-b border-line pb-2">
              <h2 className="text-sm font-semibold text-fg-muted">Distribuição por prioridade</h2>
              <p className="text-xxs text-fg-muted">
                Prioridades atribuídas aos chamados em andamento.
              </p>
            </div>
            <div className="space-y-2.5 pt-1">
              {PRIORIDADE_ORDER.map((p) => (
                <BarRow
                  key={p}
                  label={rotuloDaPrioridade[p]}
                  count={distributions.byPrioridade[p] ?? 0}
                  max={distributions.maxPrio}
                  barClass={PRIORIDADE_COLOR[p]}
                />
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5 lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Hourglass className="h-5 w-5 text-warning-fg animate-spin-slow" />
            <div>
              <h2 className="font-bold text-fg">Acompanhamento Crítico</h2>
              <p className="text-xxs text-fg-muted">
                Ordens de serviço gargalando o SLA operacional.
              </p>
            </div>
          </div>

          {agingCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-success-fg" />
              <p className="mt-2 text-sm font-semibold text-fg-muted">Operação Saudável</p>
              <p className="text-xxs text-fg-muted">Nenhum chamado aberto excedeu 7 dias.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {agingTasks.map((task) => (
                <li key={task.id} className="group">
                  <Link
                    to={`/app/solicitacoes/${task.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-muted p-3 transition-all hover:border-line-strong hover:brightness-95"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-fg group-hover:text-accent">
                        {task.titulo}
                      </p>
                      <span
                        className={cn(
                          'inline-block mt-1 text-xxs font-medium uppercase',
                          STATUS_TEXT_COLOR[task.status],
                        )}
                      >
                        {rotuloDoStatus[task.status]}
                      </span>
                    </div>
                    <Badge variant="danger" className="rounded px-2 text-base font-bold shrink-0">
                      {task.diasAberta}d abertas
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
