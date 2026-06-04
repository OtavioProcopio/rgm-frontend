import { ModeloActionsMenu } from './ModeloActionsMenu';
import { ModeloFotoCapa } from './ModeloFotoCapa';
import { ModeloStatusBadge } from './ModeloStatusBadge';
import type { Modelo } from '../types/modeloTypes';

type ModelosTableProps = {
  modelos: Modelo[];
  maquinasMap: Map<string, string>;
  isMutating?: boolean;
  onDesativar: (modelo: Modelo) => void;
};

export function ModelosTable({ isMutating, maquinasMap, modelos, onDesativar }: ModelosTableProps) {
  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {modelos.map((modelo) => (
          <article
            key={modelo.id}
            className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex gap-3">
              <ModeloFotoCapa fotoUrl={modelo.fotoUrl} />
              <div>
                <h2 className="font-semibold text-slate-950 dark:text-white">
                  {modelo.codigo} v{modelo.versao}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {modelo.descricao}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <ModeloStatusBadge ativo={modelo.ativo} />
              {modelo.temPendenciaAberta ? (
                <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Pendência aberta
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {maquinasMap.get(modelo.maquinaId) ?? modelo.maquinaId}
            </p>
            <div className="mt-4">
              <ModeloActionsMenu
                modelo={modelo}
                isMutating={isMutating}
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
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Versão</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Máquina</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pendência</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
            {modelos.map((modelo) => (
              <tr key={modelo.id}>
                <td className="px-4 py-3">
                  <ModeloFotoCapa fotoUrl={modelo.fotoUrl} />
                </td>
                <td className="px-4 py-3 font-medium text-slate-950 dark:text-white">
                  {modelo.codigo}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{modelo.versao}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{modelo.descricao}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {maquinasMap.get(modelo.maquinaId) ?? modelo.maquinaId}
                </td>
                <td className="px-4 py-3">
                  <ModeloStatusBadge ativo={modelo.ativo} />
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {modelo.temPendenciaAberta ? 'Sim' : 'Não'}
                </td>
                <td className="px-4 py-3">
                  <ModeloActionsMenu
                    modelo={modelo}
                    isMutating={isMutating}
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
