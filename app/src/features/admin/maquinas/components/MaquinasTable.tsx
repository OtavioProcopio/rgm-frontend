import type { Maquina } from '@/features/admin/modelos/types/maquinaTypes';

import { MaquinaActionsMenu } from './MaquinaActionsMenu';
import { MaquinaStatusBadge } from './MaquinaStatusBadge';

type MaquinasTableProps = {
  maquinas: Maquina[];
  isMutating?: boolean;
  onAtivar: (maquina: Maquina) => void;
  onDesativar: (maquina: Maquina) => void;
};

export function MaquinasTable({
  isMutating,
  maquinas,
  onAtivar,
  onDesativar,
}: MaquinasTableProps) {
  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {maquinas.map((maquina) => (
          <article
            key={maquina.id}
            className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-slate-950 dark:text-white">{maquina.nome}</h2>
              <MaquinaStatusBadge ativo={maquina.ativo} />
            </div>
            <div className="mt-4">
              <MaquinaActionsMenu
                maquina={maquina}
                isMutating={isMutating}
                onAtivar={onAtivar}
                onDesativar={onDesativar}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700 lg:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
            {maquinas.map((maquina) => (
              <tr key={maquina.id}>
                <td className="px-4 py-3 font-medium text-slate-950 dark:text-white">
                  {maquina.nome}
                </td>
                <td className="px-4 py-3">
                  <MaquinaStatusBadge ativo={maquina.ativo} />
                </td>
                <td className="px-4 py-3">
                  <MaquinaActionsMenu
                    maquina={maquina}
                    isMutating={isMutating}
                    onAtivar={onAtivar}
                    onDesativar={onDesativar}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
