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
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="rounded-md border border-info bg-info-soft p-4 text-sm">
      <h3 className="font-semibold text-info-fg">Alterar responsáveis</h3>
      <p className="mt-1 text-info-fg">
        Selecione os responsáveis pela execução desta solicitação.
      </p>
      <div className="mt-4 space-y-2">
        {usuarios.length === 0 ? (
          <p className="text-sm text-fg-muted">Nenhum responsável disponível.</p>
        ) : (
          usuarios.map((u) => (
            <label
              key={u.id}
              className="flex cursor-pointer items-center gap-2 pointer-coarse:min-h-11"
            >
              <input
                type="checkbox"
                checked={selecionados.includes(u.id)}
                onChange={() => toggle(u.id)}
                className="h-4 w-4 rounded border-line-strong"
              />
              <span className="text-sm text-fg">{u.nome}</span>
            </label>
          ))
        )}
      </div>
      {selecionados.length === 0 && (
        <p className="mt-2 text-xs text-danger-fg">Selecione pelo menos 1 responsável.</p>
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
