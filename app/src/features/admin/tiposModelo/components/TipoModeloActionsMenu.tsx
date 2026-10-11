import { Link } from 'react-router';

import { Button } from '@/shared/components/Button/Button';
import type { TipoDeModelo } from '@/features/admin/modelos/types/tipoModeloTypes';

type TipoModeloActionsMenuProps = {
  tipoModelo: TipoDeModelo;
  isMutating?: boolean;
  onAtivar: (tipoModelo: TipoDeModelo) => void;
  onDesativar: (tipoModelo: TipoDeModelo) => void;
};

export function TipoModeloActionsMenu({
  isMutating,
  tipoModelo,
  onAtivar,
  onDesativar,
}: TipoModeloActionsMenuProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/app/admin/tipos-modelo/${tipoModelo.id}/editar`}
        className="inline-flex items-center justify-center rounded-md bg-surface-muted px-3 py-2 text-sm font-medium text-fg transition hover:brightness-95"
      >
        Renomear
      </Link>
      {tipoModelo.ativo ? (
        <Button
          type="button"
          variant="secondary"
          disabled={isMutating}
          onClick={() => onDesativar(tipoModelo)}
        >
          Desativar
        </Button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          disabled={isMutating}
          onClick={() => onAtivar(tipoModelo)}
        >
          Ativar
        </Button>
      )}
    </div>
  );
}
