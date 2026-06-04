import type { PerfilUsuario } from '../types/usuarioTypes';

type UsuariosFiltersProps = {
  perfil?: PerfilUsuario;
  ativo?: boolean;
  onPerfilChange: (perfil?: PerfilUsuario) => void;
  onAtivoChange: (ativo?: boolean) => void;
};

export function UsuariosFilters({
  ativo,
  onAtivoChange,
  onPerfilChange,
  perfil,
}: UsuariosFiltersProps) {
  return (
    <div className="mb-4 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <span>Perfil</span>
        <select
          value={perfil ?? ''}
          onChange={(event) =>
            onPerfilChange(event.target.value ? (event.target.value as PerfilUsuario) : undefined)
          }
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="">Todos</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="GESTOR">Gestor</option>
          <option value="OPERADOR">Operador</option>
          <option value="EXTERNO">Externo</option>
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <span>Status</span>
        <select
          value={ativo === undefined ? '' : String(ativo)}
          onChange={(event) => {
            if (!event.target.value) {
              onAtivoChange(undefined);
              return;
            }

            onAtivoChange(event.target.value === 'true');
          }}
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </label>
    </div>
  );
}
