import { useState } from 'react';

import { Button } from '@/shared/components/Button/Button';

type UsuarioOpcao = { id: string; nome: string };

type Props = {
  responsaveisAtuais: string[];
  usuarios: UsuarioOpcao[];
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: (responsavelIds: string[]) => void;
};

export function AlterarResponsaveisModal({
  responsaveisAtuais,
  usuarios,
  isPending,
  onCancel,
  onConfirm,
}: Props) {
  const [selecionados, setSelecionados] = useState<string[]>(responsaveisAtuais);

  function toggle(id: string) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="rounded-md border border-sky-200 bg-sky-50 p-4 text-sm dark:border-sky-900/60 dark:bg-sky-950/30">
      <h3 className="font-semibold text-sky-900 dark:text-sky-100">Alterar responsáveis</h3>
      <p className="mt-1 text-sky-800 dark:text-sky-200">
        Selecione os responsáveis pela execução desta solicitação.
      </p>
      <div className="mt-4 space-y-2">
        {usuarios.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum responsável disponível.
          </p>
        ) : (
          usuarios.map((u) => (
            <label key={u.id} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selecionados.includes(u.id)}
                onChange={() => toggle(u.id)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-slate-800 dark:text-slate-100">{u.nome}</span>
            </label>
          ))
        )}
      </div>
      {selecionados.length === 0 && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          Selecione pelo menos 1 responsável.
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={isPending || selecionados.length === 0}
          onClick={() => onConfirm(selecionados)}
        >
          {isPending ? 'Salvando...' : 'Confirmar'}
        </Button>
      </div>
    </div>
  );
}
