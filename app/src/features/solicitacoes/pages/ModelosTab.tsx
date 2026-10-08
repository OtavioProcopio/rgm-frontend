import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Package,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useResumoDeModelos } from '@/features/admin/modelos/hooks/useResumoDeModelos';
import { useAuth } from '@/app/providers/authContext';
import { ExportarPdfButton } from '@/shared/components/ExportarPdfButton/ExportarPdfButton';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { Pagination } from '@/shared/components/Pagination/Pagination';
import { Card } from '@/shared/components/Card/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/components/Table/Table';
import { canManageModelos } from '@/shared/lib/permissions';

import { solicitacoesApi } from '../api/solicitacoesApi';
import { useMetricasPorModelo } from '../hooks/useMetricasPorModelo';
import { formatDuracao } from '../lib/solicitacaoMessages';
import type { DirecaoOrdenacao, OrdenacaoMetricaModelo } from '../types/solicitacaoTypes';
import { KPICard } from './DashboardKpiCard';

const RANKING_PAGE_SIZE = 10;

export function ModelosTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const listaModelosPath = canManageModelos(user?.perfil) ? '/app/admin/modelos' : '/app/modelos';

  const { data: resumo, isLoading, isError } = useResumoDeModelos();

  function irParaSolicitacoesDaMaquina(maquina: string) {
    navigate(`/app/solicitacoes?maquina=${encodeURIComponent(maquina)}`);
  }

  const stats = {
    total: resumo?.total ?? 0,
    ativos: resumo?.ativos ?? 0,
    inativos: resumo?.inativos ?? 0,
    comPendencia: resumo?.comPendenciaAberta ?? 0,
    maquinasOrdenadas: [...(resumo?.porMaquina ?? [])]
      .sort((a, b) => b.quantidade - a.quantidade)
      .map(({ maquina, quantidade }) => [maquina, quantidade] as const),
  };

  if (isLoading) return <LoadingState title="Carregando estatísticas de modelos..." />;
  if (isError) {
    return (
      <ErrorState
        title="Não foi possível carregar os modelos"
        description="Verifique sua conexão com o servidor."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPICard
          icon={Package}
          label="Total"
          value={stats.total}
          subtext="Modelos cadastrados"
          gradient="sky"
          onClickPath={listaModelosPath}
        />
        <KPICard
          icon={CheckCircle2}
          label="Ativos"
          value={stats.ativos}
          subtext="Em uso"
          gradient="emerald"
        />
        <KPICard
          icon={XCircle}
          label="Inativos"
          value={stats.inativos}
          subtext="Desativados"
          gradient="slate"
        />
        <KPICard
          icon={AlertTriangle}
          label="Com pendência"
          value={stats.comPendencia}
          subtext="Solicitação aberta"
          gradient={stats.comPendencia > 0 ? 'amber' : 'slate'}
        />
      </div>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-fg-muted">Modelos por máquina</h2>
        {stats.maquinasOrdenadas.length === 0 ? (
          <p className="text-sm text-fg-muted">Nenhum modelo cadastrado.</p>
        ) : (
          <Table className="rounded-lg">
            <TableHead className="[&_th]:py-3.5">
              <TableRow>
                <TableHeaderCell>Máquina</TableHeaderCell>
                <TableHeaderCell className="text-right">Modelos</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.maquinasOrdenadas.map(([maquina, count]) => (
                <TableRow
                  key={maquina}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver solicitações da máquina ${maquina}`}
                  onClick={() => irParaSolicitacoesDaMaquina(maquina)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      irParaSolicitacoesDaMaquina(maquina);
                    }
                  }}
                  className="cursor-pointer transition-colors hover:bg-surface-muted"
                >
                  <TableCell className="font-medium text-fg-muted">{maquina}</TableCell>
                  <TableCell className="text-right tabular-nums text-fg-muted">{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <RankingModelos />
    </div>
  );
}

function RankingModelos() {
  const [sort, setSort] = useState<OrdenacaoMetricaModelo>('TEMPO_RESOLUCAO');
  const [dir, setDir] = useState<DirecaoOrdenacao>('desc');
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useMetricasPorModelo({
    sort,
    dir,
    page,
    size: RANKING_PAGE_SIZE,
  });

  function handleSort(campo: OrdenacaoMetricaModelo) {
    if (sort === campo) {
      setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(campo);
      setDir('desc');
    }
    setPage(0);
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-fg-muted">Ranking de modelos por tempo</h2>
        <ExportarPdfButton
          buscar={() => solicitacoesApi.exportarMetricasPorModeloPdf({ sort, dir })}
          nomeDoArquivo={() => `ranking-modelos-por-tempo-${Date.now()}.pdf`}
        />
      </div>

      {isLoading ? <LoadingState title="Carregando ranking..." /> : null}
      {isError ? (
        <ErrorState
          title="Não foi possível carregar o ranking"
          description="Verifique sua conexão com o servidor."
        />
      ) : null}
      {data && data.content.length === 0 ? (
        <EmptyState
          title="Nenhum modelo com dados suficientes"
          description="O ranking exibe modelos com ao menos uma solicitação concluída."
        />
      ) : null}

      {data && data.content.length > 0 ? (
        <>
          <Table className="rounded-lg">
            <TableHead className="[&_th]:py-3.5">
              <TableRow>
                <TableHeaderCell>Código</TableHeaderCell>
                <SortableHeader
                  label="Tempo médio de resolução"
                  active={sort === 'TEMPO_RESOLUCAO'}
                  dir={dir}
                  onClick={() => handleSort('TEMPO_RESOLUCAO')}
                />
                <SortableHeader
                  label="Intervalo médio entre solicitações"
                  active={sort === 'INTERVALO'}
                  dir={dir}
                  onClick={() => handleSort('INTERVALO')}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.content.map((m) => (
                <TableRow key={m.modeloId}>
                  <TableCell className="font-medium text-fg-muted">{m.codigo}</TableCell>
                  <TableCell className="text-right tabular-nums text-fg-muted">
                    {formatDuracao(m.tempoMedioResolucaoSegundos)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-fg-muted">
                    {m.intervaloMedioSegundos != null
                      ? formatDuracao(m.intervaloMedioSegundos)
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            itemLabel="modelo(s)"
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </>
      ) : null}
    </Card>
  );
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: DirecaoOrdenacao;
  onClick: () => void;
}) {
  const Icon = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHeaderCell className="text-right">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 uppercase hover:text-fg"
      >
        {label}
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </TableHeaderCell>
  );
}
