import { Link } from 'react-router';

import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';
import { cn } from '@/shared/lib/cn';

type Props = {
  modelo: Modelo;
  linkBase?: string;
};

export function ModeloCard({ modelo, linkBase = '/app/modelos' }: Props) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      {modelo.fotoUrl ? (
        <img
          src={modelo.fotoUrl}
          alt={modelo.codigo}
          className="h-36 w-full object-cover"
        />
      ) : (
        <div className="flex h-36 w-full items-center justify-center bg-slate-100 dark:bg-slate-700">
          <span className="text-3xl font-bold text-slate-300 dark:text-slate-600">
            {modelo.codigo.slice(0, 2)}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <p className="font-semibold text-slate-900 dark:text-white">{modelo.codigo}</p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {modelo.descricao}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
              modelo.ativo
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
            )}
          >
            {modelo.ativo ? 'Ativo' : 'Inativo'}
          </span>
          {modelo.temPendenciaAberta ? (
            <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              Pendência aberta
            </span>
          ) : null}
        </div>
        <Link
          to={`${linkBase}/${modelo.id}`}
          className="mt-auto pt-3 text-xs font-medium text-sky-600 transition-colors hover:text-sky-700 hover:underline dark:text-sky-400 dark:hover:text-sky-300"
        >
          Ver detalhes →
        </Link>
      </div>
    </div>
  );
}
