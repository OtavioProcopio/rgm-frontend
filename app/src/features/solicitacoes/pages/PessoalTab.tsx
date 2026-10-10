import { CheckCircle2, ClipboardList, UserCheck } from 'lucide-react';
import { Link } from 'react-router';

import { usePerfil } from '@/features/auth/hooks/usePerfil';
import { Button } from '@/shared/components/Button/Button';
import { Card } from '@/shared/components/Card/Card';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { Pagination } from '@/shared/components/Pagination/Pagination';
import { cn } from '@/shared/lib/cn';
import { rotuloDoStatus } from '@/shared/lib/rotulos';
import type { PageResponse } from '@/shared/types/page';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { solicitacoesKeys } from '../hooks/solicitacoesKeys';
import type {
  Solicitacao,
  SolicitacoesFilters,
  StatusSolicitacao,
} from '../types/solicitacaoTypes';
import { KPICard } from './DashboardKpiCard';

const STATUS_TEXT_COLOR: Record<StatusSolicitacao, string> = {
  A_FAZER: 'text-fg-muted',
  EM_ANDAMENTO: 'text-info-fg',
  EM_VALIDACAO: 'text-warning-fg',
  CONCLUIDA: 'text-success-fg',
  CANCELADA: 'text-danger-fg',
};

function ListaSolicitacoes({ itens }: { itens: Solicitacao[] }) {
  if (itens.length === 0) {
    return <p className="text-sm text-fg-muted">Nenhuma solicitação encontrada.</p>;
  }
  return (
    <ul className="space-y-2.5">
      {itens.map((s) => (
        <li key={s.id} className="group">
          <Link
            to={`/app/solicitacoes/${s.id}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-muted p-3 transition-all hover:border-accent"
          >
            <p className="min-w-0 flex-1 truncate text-xs font-semibold text-fg group-hover:text-accent">
              {s.titulo}
            </p>
            <span
              className={cn('shrink-0 text-xxs font-medium uppercase', STATUS_TEXT_COLOR[s.status])}
            >
              {rotuloDoStatus[s.status]}
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
  // A lista encolhe por ação ou por evento de tempo real: se a página atual deixou de
  // existir, volta para a última que existe.
  const ultimaPagina = Math.max((dados?.totalPages ?? 1) - 1, 0);
  const paginaSumiu = dados !== undefined && dados.page > ultimaPagina;
  useEffect(() => {
    if (paginaSumiu) onPagina(ultimaPagina);
  }, [paginaSumiu, ultimaPagina, onPagina]);

  return (
    <Card className="space-y-4 p-5">
      <h2 className="text-sm font-semibold text-fg-muted">{titulo}</h2>
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
    </Card>
  );
}

function PessoalVazia() {
  return (
    <EmptyState
      title="Nada por aqui ainda"
      description="Você ainda não abriu nem recebeu solicitações."
      action={
        <Link to="/app/solicitacoes">
          <Button>Ver o quadro</Button>
        </Link>
      }
    />
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

  const semNada =
    (minhas?.totalElements ?? 0) === 0 &&
    (sobMinhaResponsabilidade?.totalElements ?? 0) === 0 &&
    (concluidas ?? 0) === 0;
  if (semNada) return <PessoalVazia />;

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
