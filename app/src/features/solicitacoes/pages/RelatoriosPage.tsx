import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';

import { useMetricas } from '../hooks/useMetricas';
import type { StatusSolicitacao } from '../types/solicitacaoTypes';

const STATUS_LABEL: Record<StatusSolicitacao, string> = {
  A_FAZER: 'A fazer',
  EM_ANDAMENTO: 'Em andamento',
  EM_VALIDACAO: 'Em validação',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

function formatDuration(seconds: number): string {
  if (seconds <= 0) return '—';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

export function RelatoriosPage() {
  const { data, isLoading, isError } = useMetricas();

  if (isLoading) return <LoadingState />;
  if (isError || !data) {
    return <ErrorState title="Erro ao carregar métricas" description="Tente novamente mais tarde." />;
  }

  const total = data.totalSolicitacoes || 1;
  const statusEntries = Object.entries(data.solicitacoesPorStatus) as [StatusSolicitacao, number][];

  return (
    <section>
      <PageHeader title="Relatórios" description="Métricas e distribuição das solicitações." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{data.totalSolicitacoes}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Abertas</p>
          <p className="mt-1 text-2xl font-bold text-sky-600 dark:text-sky-400">{data.solicitacoesAbertas}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Pendentes</p>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{data.solicitacoesPendentes}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Concluídas</p>
          <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{data.solicitacoesConcluidas}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Tempo médio de resolução
        </h2>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {formatDuration(data.tempoMedioResolucaoSegundos)}
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Distribuição por status
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Quantidade</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {statusEntries.map(([status, count]) => (
                <tr key={status} className="bg-white dark:bg-slate-800/50">
                  <td className="px-4 py-3 text-slate-900 dark:text-white">{STATUS_LABEL[status]}</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{count}</td>
                  <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                    {((count / total) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
