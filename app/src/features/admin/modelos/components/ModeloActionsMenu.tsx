import { Link } from 'react-router';

import { Button } from '@/shared/components/Button/Button';

import type { Modelo } from '../types/modeloTypes';

type ModeloActionsMenuProps = {
  modelo: Modelo;
  isMutating?: boolean;
  onDesativar: (modelo: Modelo) => void;
};

export function ModeloActionsMenu({ isMutating, modelo, onDesativar }: ModeloActionsMenuProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/app/admin/modelos/${modelo.id}`}
        className="inline-flex items-center justify-center rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        Detalhes
      </Link>
      <Link
        to={`/app/admin/modelos/${modelo.id}/editar`}
        className="inline-flex items-center justify-center rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        Editar
      </Link>
      {modelo.ativo ? (
        <Button
          type="button"
          variant="secondary"
          disabled={isMutating}
          onClick={() => onDesativar(modelo)}
        >
          Desativar
        </Button>
      ) : null}
    </div>
  );
}
