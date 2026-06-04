import { Link } from 'react-router';

import { Button } from '@/shared/components/Button/Button';

import type { Usuario } from '../types/usuarioTypes';

type UsuarioActionsMenuProps = {
  usuario: Usuario;
  isMutating?: boolean;
  onAtivar: (usuario: Usuario) => void;
  onDesativar: (usuario: Usuario) => void;
  onExcluir: (usuario: Usuario) => void;
};

export function UsuarioActionsMenu({
  isMutating,
  onAtivar,
  onDesativar,
  onExcluir,
  usuario,
}: UsuarioActionsMenuProps) {
  // TODO: bloquear autodesativação quando o AuthUser expuser id.
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/app/admin/usuarios/${usuario.id}/editar`}
        className="inline-flex items-center justify-center rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        Editar
      </Link>
      {usuario.ativo ? (
        <Button
          type="button"
          variant="secondary"
          disabled={isMutating}
          onClick={() => onDesativar(usuario)}
        >
          Desativar
        </Button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          disabled={isMutating}
          onClick={() => onAtivar(usuario)}
        >
          Ativar
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        disabled={isMutating}
        onClick={() => onExcluir(usuario)}
      >
        Excluir
      </Button>
    </div>
  );
}
