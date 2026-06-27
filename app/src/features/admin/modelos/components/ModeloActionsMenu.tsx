import { Link } from 'react-router';

import type { Modelo } from '../types/modeloTypes';

type ModeloActionsMenuProps = {
  modelo: Modelo;
};

export function ModeloActionsMenu({
  modelo,
}: ModeloActionsMenuProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/app/admin/modelos/${modelo.id}`}
        className="inline-flex items-center justify-center rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        Detalhes
      </Link>
      {modelo.ativo ? (
        <Link
          to={`/app/solicitacoes/nova?modeloId=${modelo.id}`}
          className="inline-flex items-center justify-center rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          Abrir solicitação
        </Link>
      ) : null}
    </div>
  );
}
