import { Button } from '@/shared/components/Button/Button';

import type { Maquina } from '../types/maquinaTypes';

type DeleteMaquinaDialogProps = {
  maquina: Maquina;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteMaquinaDialog({
  isDeleting,
  maquina,
  onCancel,
  onConfirm,
}: DeleteMaquinaDialogProps) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-100">
      <h3 className="font-semibold">Excluir máquina</h3>
      <p className="mt-2">
        Esta ação pode falhar se a máquina possuir modelos vinculados. Deseja continuar?
      </p>
      <p className="mt-1 font-medium">
        {maquina.codigo} - {maquina.nome}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={isDeleting} onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={isDeleting}
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
        >
          {isDeleting ? 'Excluindo...' : 'Excluir'}
        </Button>
      </div>
    </div>
  );
}
