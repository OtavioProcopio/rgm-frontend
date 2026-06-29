import { useState } from 'react';

import { cn } from '@/shared/lib/cn';

import { useHistoricoMetricas } from '../hooks/useHistoricoMetricas';

const PERIODOS: { dias: number; label: string }[] = [
  { dias: 7, label: '7 dias' },
  { dias: 30, label: '30 dias' },
  { dias: 90, label: '90 dias' },
];

export function HistoricoChart() {
  const [dias, setDias] = useState(30);
  const { data, isLoading, isError } = useHistoricoMetricas(dias);

  const series = data?.series ?? [];
  const maxTotal = series.reduce((max, p) => Math.max(max, p.total), 0) || 1;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Histórico de Solicitações
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {data?.periodoLabel ?? 'Evolução temporal'}
            {data ? ` · SLA médio ${data.slaGlobalMediaHoras}h` : ''}
          </p>
        </div>
        <div className="inline-flex gap-1 self-start rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
          {PERIODOS.map((p) => (
            <button
              key={p.dias}
              type="button"
              onClick={() => setDias(p.dias)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                dias === p.dias
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-slate-400">Carregando histórico...</p>
      ) : isError ? (
        <p className="py-8 text-center text-sm text-rose-500">
          Não foi possível carregar o histórico.
        </p>
      ) : series.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Sem dados no período.</p>
      ) : (
        <>
          <div className="flex h-44 items-end gap-1 overflow-x-auto">
            {series.map((p) => {
              const totalHeight = (p.total / maxTotal) * 100;
              const concluidasPct = p.total > 0 ? (p.concluidas / p.total) * 100 : 0;
              const canceladasPct = p.total > 0 ? (p.canceladas / p.total) * 100 : 0;
              const abertasPct = p.total > 0 ? (p.abertas / p.total) * 100 : 0;
              return (
                <div
                  key={p.periodo}
                  className="group flex min-w-[14px] flex-1 flex-col items-center justify-end"
                  title={`${p.periodo}: ${p.total} total · ${p.abertas} abertas · ${p.concluidas} concluídas · ${p.canceladas} canceladas · SLA ${p.slaMediaHoras}h`}
                >
                  <div
                    className="flex w-full flex-col-reverse overflow-hidden rounded-t"
                    style={{ height: `${totalHeight}%` }}
                  >
                    <div className="bg-emerald-500" style={{ height: `${concluidasPct}%` }} />
                    <div className="bg-rose-400" style={{ height: `${canceladasPct}%` }} />
                    <div className="bg-sky-500" style={{ height: `${abertasPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <LegendItem className="bg-sky-500" label="Abertas" />
            <LegendItem className="bg-emerald-500" label="Concluídas" />
            <LegendItem className="bg-rose-400" label="Canceladas" />
          </div>
        </>
      )}
    </div>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-2.5 w-2.5 rounded-sm', className)} />
      {label}
    </span>
  );
}
