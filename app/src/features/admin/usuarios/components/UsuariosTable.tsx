import { UsuarioActionsMenu } from './UsuarioActionsMenu';
import { UsuarioPerfilBadge } from './UsuarioPerfilBadge';
import { UsuarioStatusBadge } from './UsuarioStatusBadge';
import type { Usuario } from '../types/usuarioTypes';

type UsuariosTableProps = {
  usuarios: Usuario[];
  isMutating?: boolean;
  onAtivar: (usuario: Usuario) => void;
  onDesativar: (usuario: Usuario) => void;
  onExcluir: (usuario: Usuario) => void;
};

export function UsuariosTable({
  isMutating,
  onAtivar,
  onDesativar,
  onExcluir,
  usuarios,
}: UsuariosTableProps) {
  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {usuarios.map((usuario) => (
          <article
            key={usuario.id}
            className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-950 dark:text-white">{usuario.nome}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {usuario.email ?? 'Não possui login'}
                </p>
              </div>
              <UsuarioStatusBadge ativo={usuario.ativo} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <UsuarioPerfilBadge perfil={usuario.perfil} />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Criado em {formatDate(usuario.criadoEm)}
              </span>
            </div>
            <div className="mt-4">
              <UsuarioActionsMenu
                usuario={usuario}
                isMutating={isMutating}
                onAtivar={onAtivar}
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
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-4 py-3 font-medium text-slate-950 dark:text-white">
                  {usuario.nome}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {usuario.email ?? 'Não possui login'}
                </td>
                <td className="px-4 py-3">
                  <UsuarioPerfilBadge perfil={usuario.perfil} />
                </td>
                <td className="px-4 py-3">
                  <UsuarioStatusBadge ativo={usuario.ativo} />
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {formatDate(usuario.criadoEm)}
                </td>
                <td className="px-4 py-3">
                  <UsuarioActionsMenu
                    usuario={usuario}
                    isMutating={isMutating}
                    onAtivar={onAtivar}
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
