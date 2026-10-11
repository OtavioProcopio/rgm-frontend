import { ConfirmDialog } from '@/shared/components/ConfirmDialog/ConfirmDialog';

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
    <ConfirmDialog
      title="Confirmar exclusão"
      message={
        <>
          Você está prestes a excluir <strong>{usuario.nome}</strong>. Esta operação usa o endpoint
          genérico de registros e pode falhar se houver vínculos com outras informações.
        </>
      }
      confirmLabel="Excluir usuário"
      variant="danger"
      isPending={isDeleting}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
