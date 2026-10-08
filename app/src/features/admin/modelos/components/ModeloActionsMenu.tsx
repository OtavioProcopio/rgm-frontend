import { Link } from 'react-router';

import type { Modelo } from '../types/modeloTypes';

type ModeloActionsMenuProps = {
  modelo: Modelo;
};

const ACAO =
  'inline-flex items-center justify-center rounded-md bg-surface-muted px-3 py-2 pointer-coarse:min-h-11 text-sm font-medium text-fg transition hover:brightness-95';

export function ModeloActionsMenu({ modelo }: ModeloActionsMenuProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link to={`/app/admin/modelos/${modelo.id}`} className={ACAO}>
        Detalhes
      </Link>
      {modelo.ativo ? (
        <Link to={`/app/solicitacoes/nova?modeloId=${modelo.id}`} className={ACAO}>
          Abrir solicitação
        </Link>
      ) : null}
    </div>
  );
}
