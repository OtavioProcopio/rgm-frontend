import { EmptyState } from '@/shared/components/EmptyState/EmptyState';

import type { EventoModelo } from '../types/modeloTypes';

export function EventosModeloList({ eventos }: { eventos: EventoModelo[] }) {
  if (eventos.length === 0) {
    return (
      <EmptyState
        title="Nenhum evento registrado"
        description="O modelo ainda não possui eventos."
      />
    );
  }

  return (
    <ol className="space-y-3">
      {eventos.map((evento) => (
        <li
          key={evento.id}
          className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-slate-950 dark:text-white">{evento.titulo}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(evento.criadoEm)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {evento.descricao ?? evento.tipo}
          </p>
          {evento.estadoModeloDescricao ? (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {evento.estadoModeloDescricao}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  );
}
