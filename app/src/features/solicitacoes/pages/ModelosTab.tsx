import { AlertTriangle, CheckCircle2, Package, XCircle } from 'lucide-react';
import { useMemo } from 'react';

import { useModelos } from '@/features/admin/modelos/hooks/useModelos';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';

import { KPICard } from './DashboardKpiCard';

export function ModelosTab() {
  const { data, isLoading, isError } = useModelos({ page: 0, size: 100 });

  const stats = useMemo(() => {
    const modelos = data?.content ?? [];
    const total = data?.totalElements ?? modelos.length;
    const ativos = modelos.filter((m) => m.ativo).length;
    const inativos = modelos.filter((m) => !m.ativo).length;
    const comPendencia = modelos.filter((m) => m.temPendenciaAberta).length;

    const porMaquina: Record<string, number> = {};
    for (const m of modelos) {
      porMaquina[m.maquina] = (porMaquina[m.maquina] ?? 0) + 1;
    }
    const maquinasOrdenadas = Object.entries(porMaquina).sort((a, b) => b[1] - a[1]);

    return { total, ativos, inativos, comPendencia, maquinasOrdenadas };
  }, [data]);

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
          onClickPath="/app/admin/modelos"
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
                  <tr key={maquina} className="bg-white dark:bg-slate-800/50">
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
    </div>
  );
}
