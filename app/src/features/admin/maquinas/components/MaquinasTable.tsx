import { MaquinaActionsMenu } from './MaquinaActionsMenu';
import { MaquinaStatusBadge } from './MaquinaStatusBadge';
import type { Maquina } from '../types/maquinaTypes';

type MaquinasTableProps = {
  maquinas: Maquina[];
  isMutating?: boolean;
  onDesativar: (maquina: Maquina) => void;
  onExcluir: (maquina: Maquina) => void;
};

export function MaquinasTable({
  isMutating,
  maquinas,
  onDesativar,
  onExcluir,
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
              <div>
                <h2 className="font-semibold text-slate-950 dark:text-white">{maquina.codigo}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{maquina.nome}</p>
              </div>
              <MaquinaStatusBadge ativa={maquina.ativa} />
            </div>
            {maquina.descricao ? (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{maquina.descricao}</p>
            ) : null}
            <div className="mt-4">
              <MaquinaActionsMenu
                maquina={maquina}
                isMutating={isMutating}
                onDesativar={onDesativar}
                onExcluir={onExcluir}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700 lg:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Criada em</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
            {maquinas.map((maquina) => (
              <tr key={maquina.id}>
                <td className="px-4 py-3 font-medium text-slate-950 dark:text-white">
                  {maquina.codigo}
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{maquina.nome}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {maquina.descricao ?? '-'}
                </td>
                <td className="px-4 py-3">
                  <MaquinaStatusBadge ativa={maquina.ativa} />
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {formatDate(maquina.criadaEm)}
                </td>
                <td className="px-4 py-3">
                  <MaquinaActionsMenu
                    maquina={maquina}
                    isMutating={isMutating}
                    onDesativar={onDesativar}
                    onExcluir={onExcluir}
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}
