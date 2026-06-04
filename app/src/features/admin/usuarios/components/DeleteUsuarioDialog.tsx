import { Button } from '@/shared/components/Button/Button';

import type { Usuario } from '../types/usuarioTypes';

type DeleteUsuarioDialogProps = {
  usuario: Usuario;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteUsuarioDialog({
  isDeleting,
  onCancel,
  onConfirm,
  usuario,
}: DeleteUsuarioDialogProps) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-100">
      <h3 className="font-semibold">Confirmar exclusão</h3>
      <p className="mt-2">
        Você está prestes a excluir <strong>{usuario.nome}</strong>. Esta operação usa o endpoint
        genérico de registros e pode falhar se houver vínculos com outras informações.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isDeleting}>
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700 focus-visible:outline-red-500 dark:bg-red-600 dark:hover:bg-red-500"
        >
          {isDeleting ? 'Excluindo...' : 'Excluir usuário'}
        </Button>
      </div>
    </div>
  );
}
