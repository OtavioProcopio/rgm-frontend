import { CheckCircle2, ClipboardList, UserCheck } from 'lucide-react';
import { Link } from 'react-router';

import { usePerfil } from '@/features/auth/hooks/usePerfil';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { cn } from '@/shared/lib/cn';
import { useQuery } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { solicitacoesKeys } from '../hooks/solicitacoesKeys';
import { statusLabel } from '../lib/solicitacaoMessages';
import type { Solicitacao, SolicitacoesFilters, StatusSolicitacao } from '../types/solicitacaoTypes';
import { KPICard } from './DashboardKpiCard';

const STATUS_TEXT_COLOR: Record<StatusSolicitacao, string> = {
  A_FAZER: 'text-slate-600 dark:text-slate-400',
  EM_ANDAMENTO: 'text-sky-600 dark:text-sky-400',
  EM_VALIDACAO: 'text-amber-600 dark:text-amber-400',
  CONCLUIDA: 'text-emerald-600 dark:text-emerald-400',
  CANCELADA: 'text-rose-600 dark:text-rose-400',
};

function isAberta(s: Solicitacao) {
  return s.status !== 'CONCLUIDA' && s.status !== 'CANCELADA';
}

function ListaSolicitacoes({ itens }: { itens: Solicitacao[] }) {
  if (itens.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma solicitação encontrada.</p>
    );
  }
  return (
    <ul className="space-y-2.5">
      {itens.map((s) => (
        <li key={s.id} className="group">
          <Link
            to={`/app/solicitacoes/${s.id}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all hover:bg-sky-50/40 hover:border-sky-200 dark:border-slate-700/50 dark:bg-slate-900/30 dark:hover:bg-sky-950/20 dark:hover:border-sky-900/40"
          >
            <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-700 dark:group-hover:text-sky-400">
              {s.titulo}
            </p>
            <span
              className={cn(
                'shrink-0 text-xxs font-medium uppercase',
                STATUS_TEXT_COLOR[s.status],
              )}
            >
              {statusLabel[s.status]}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function useSolicitacoesTotal(filters: SolicitacoesFilters, enabled: boolean) {
  return useQuery({
    queryKey: solicitacoesKeys.list(filters),
    queryFn: () => solicitacoesApi.listar(filters),
    enabled,
    select: (data) => data.totalElements,
  });
}

export function PessoalTab() {
  const { data: profile, isLoading: loadingPerfil } = usePerfil();
  const userId = profile?.id;
  const enabled = Boolean(userId);

  const filtersMinhas: SolicitacoesFilters = { page: 0, size: 100, abertaPorUsuarioId: userId };
  const filtersResponsavel: SolicitacoesFilters = { page: 0, size: 100, responsavelId: userId };

  const { data: minhasData, isLoading: loadingMinhas } = useQuery({
    queryKey: solicitacoesKeys.list(filtersMinhas),
    queryFn: () => solicitacoesApi.listar(filtersMinhas),
    enabled,
  });

  const { data: responsavelData, isLoading: loadingResponsavel } = useQuery({
    queryKey: solicitacoesKeys.list(filtersResponsavel),
    queryFn: () => solicitacoesApi.listar(filtersResponsavel),
    enabled,
  });

  // Contagens exatas via totalElements da paginação (não via .length de um array
  // limitado a 100 itens) — ver issue #60: capar em memória sub-contava usuários
  // com mais de 100 solicitações no histórico.
  const { data: minhasConcluidas, isLoading: loadingMinhasConcluidas } = useSolicitacoesTotal(
    { page: 0, size: 1, abertaPorUsuarioId: userId, status: 'CONCLUIDA' },
    enabled,
  );
  const { data: minhasCanceladas, isLoading: loadingMinhasCanceladas } = useSolicitacoesTotal(
    { page: 0, size: 1, abertaPorUsuarioId: userId, status: 'CANCELADA' },
    enabled,
  );
  const { data: responsavelConcluidas, isLoading: loadingResponsavelConcluidas } = useSolicitacoesTotal(
    { page: 0, size: 1, responsavelId: userId, status: 'CONCLUIDA' },
    enabled,
  );
  const { data: responsavelCanceladas, isLoading: loadingResponsavelCanceladas } = useSolicitacoesTotal(
    { page: 0, size: 1, responsavelId: userId, status: 'CANCELADA' },
    enabled,
  );

  const minhasAbertas = (minhasData?.content ?? []).filter(isAberta);
  const souResponsavel = (responsavelData?.content ?? []).filter(isAberta);

  const minhasAbertasCount =
    minhasData && minhasConcluidas !== undefined && minhasCanceladas !== undefined
      ? minhasData.totalElements - minhasConcluidas - minhasCanceladas
      : minhasAbertas.length;

  const souResponsavelCount =
    responsavelData && responsavelConcluidas !== undefined && responsavelCanceladas !== undefined
      ? responsavelData.totalElements - responsavelConcluidas - responsavelCanceladas
      : souResponsavel.length;

  const concluidasComoResponsavelCount =
    responsavelConcluidas ??
    (responsavelData?.content ?? []).filter((s) => s.status === 'CONCLUIDA').length;

  if (
    loadingPerfil ||
    loadingMinhas ||
    loadingResponsavel ||
    loadingMinhasConcluidas ||
    loadingMinhasCanceladas ||
    loadingResponsavelConcluidas ||
    loadingResponsavelCanceladas
  ) {
    return <LoadingState title="Carregando seu painel pessoal..." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          icon={ClipboardList}
          label="Abertas por mim"
          value={minhasAbertasCount}
          subtext="Em andamento"
          gradient="sky"
        />
        <KPICard
          icon={UserCheck}
          label="Sou responsável"
          value={souResponsavelCount}
          subtext="Atribuídas a mim"
          gradient="amber"
        />
        <KPICard
          icon={CheckCircle2}
          label="Concluídas por mim"
          value={concluidasComoResponsavelCount}
          subtext="Como responsável"
          gradient="emerald"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Minhas solicitações abertas
          </h2>
          <ListaSolicitacoes itens={minhasAbertas} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Sob minha responsabilidade
          </h2>
          <ListaSolicitacoes itens={souResponsavel} />
        </div>
      </div>
    </div>
  );
}
