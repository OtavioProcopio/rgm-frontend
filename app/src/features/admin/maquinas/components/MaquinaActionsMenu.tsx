import { Link } from 'react-router';

import { Button } from '@/shared/components/Button/Button';

import type { Maquina } from '../types/maquinaTypes';

type MaquinaActionsMenuProps = {
  maquina: Maquina;
  isMutating?: boolean;
  onDesativar: (maquina: Maquina) => void;
  onExcluir: (maquina: Maquina) => void;
};

export function MaquinaActionsMenu({
  isMutating,
  maquina,
  onDesativar,
  onExcluir,
}: MaquinaActionsMenuProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/app/admin/maquinas/${maquina.id}/editar`}
        className="inline-flex items-center justify-center rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        Editar
      </Link>
      {maquina.ativa ? (
        <Button
          type="button"
          variant="secondary"
          disabled={isMutating}
          onClick={() => onDesativar(maquina)}
        >
          Desativar
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        disabled={isMutating}
        onClick={() => onExcluir(maquina)}
      >
        Excluir
      </Button>
    </div>
  );
}
