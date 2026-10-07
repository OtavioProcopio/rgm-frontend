import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Package, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useResumoDeModelos } from '@/features/admin/modelos/hooks/useResumoDeModelos';
import { useAuth } from '@/app/providers/authContext';
import { ExportarPdfButton } from '@/shared/components/ExportarPdfButton/ExportarPdfButton';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { Pagination } from '@/shared/components/Pagination/Pagination';
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

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Modelos por máquina
        </h2>
        {stats.maquinasOrdenadas.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum modelo cadastrado.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">
                    Máquina
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">
                    Modelos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {stats.maquinasOrdenadas.map(([maquina, count]) => (
                  <tr
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
                    className="cursor-pointer bg-white transition-colors hover:bg-sky-50 dark:bg-slate-800/50 dark:hover:bg-sky-950/20"
                  >
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {maquina}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Ranking de modelos por tempo
        </h2>
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
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">
                    Código
                  </th>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {data.content.map((m) => (
                  <tr key={m.modeloId} className="bg-white dark:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {m.codigo}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {formatDuracao(m.tempoMedioResolucaoSegundos)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {m.intervaloMedioSegundos != null ? formatDuracao(m.intervaloMedioSegundos) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </div>
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
    <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
      >
        {label}
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </th>
  );
}
