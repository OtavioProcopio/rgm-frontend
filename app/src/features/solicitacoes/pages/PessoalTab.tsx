import { CheckCircle2, ClipboardList, UserCheck } from 'lucide-react';
import { Link } from 'react-router';

import { usePerfil } from '@/features/auth/hooks/usePerfil';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { Pagination } from '@/shared/components/Pagination/Pagination';
import { cn } from '@/shared/lib/cn';
import type { PageResponse } from '@/shared/types/page';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

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

/** Solicitações por página em cada lista da aba pessoal. */
const TAMANHO_DA_PAGINA = 10;

function useListaEmAberto(filtros: SolicitacoesFilters, enabled: boolean) {
  return useQuery({
    queryKey: solicitacoesKeys.list(filtros),
    queryFn: () => solicitacoesApi.listar(filtros),
    enabled,
    // Mantém a página anterior na tela enquanto a seguinte chega.
    placeholderData: keepPreviousData,
  });
}

function ListaPaginada({
  titulo,
  dados,
  onPagina,
}: {
  titulo: string;
  dados: PageResponse<Solicitacao> | undefined;
  onPagina: (pagina: number) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 space-y-4">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{titulo}</h2>
      <ListaSolicitacoes itens={dados?.content ?? []} />
      {dados && dados.totalPages > 1 ? (
        <Pagination
          page={dados.page}
          totalPages={dados.totalPages}
          totalElements={dados.totalElements}
          itemLabel="solicitação(ões)"
          onPrev={() => onPagina(dados.page - 1)}
          onNext={() => onPagina(dados.page + 1)}
        />
      ) : null}
    </div>
  );
}

export function PessoalTab() {
  const { data: profile, isLoading: loadingPerfil } = usePerfil();
  const userId = profile?.id;
  const enabled = Boolean(userId);
  const [paginaMinhas, setPaginaMinhas] = useState(0);
  const [paginaResponsavel, setPaginaResponsavel] = useState(0);

  const { data: minhas, isLoading: loadingMinhas } = useListaEmAberto(
    { page: paginaMinhas, size: TAMANHO_DA_PAGINA, abertaPorUsuarioId: userId, emAberto: true },
    enabled,
  );
  const { data: sobMinhaResponsabilidade, isLoading: loadingResponsavel } = useListaEmAberto(
    { page: paginaResponsavel, size: TAMANHO_DA_PAGINA, responsavelId: userId, emAberto: true },
    enabled,
  );
  // Só a contagem: a lista de concluídas não é exibida.
  const filtrosConcluidas: SolicitacoesFilters = {
    page: 0,
    size: 1,
    responsavelId: userId,
    status: 'CONCLUIDA',
  };
  const { data: concluidas, isLoading: loadingConcluidas } = useQuery({
    queryKey: solicitacoesKeys.list(filtrosConcluidas),
    queryFn: () => solicitacoesApi.listar(filtrosConcluidas),
    enabled,
    select: (data) => data.totalElements,
  });

  if (loadingPerfil || loadingMinhas || loadingResponsavel || loadingConcluidas) {
    return <LoadingState title="Carregando seu painel pessoal..." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          icon={ClipboardList}
          label="Abertas por mim"
          value={minhas?.totalElements ?? 0}
          subtext="Em andamento"
          gradient="sky"
        />
        <KPICard
          icon={UserCheck}
          label="Sou responsável"
          value={sobMinhaResponsabilidade?.totalElements ?? 0}
          subtext="Atribuídas a mim"
          gradient="amber"
        />
        <KPICard
          icon={CheckCircle2}
          label="Concluídas por mim"
          value={concluidas ?? 0}
          subtext="Como responsável"
          gradient="emerald"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ListaPaginada
          titulo="Minhas solicitações abertas"
          dados={minhas}
          onPagina={setPaginaMinhas}
        />
        <ListaPaginada
          titulo="Sob minha responsabilidade"
          dados={sobMinhaResponsabilidade}
          onPagina={setPaginaResponsavel}
        />
      </div>
    </div>
  );
}
