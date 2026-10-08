import { rotuloDoPerfil } from '@/shared/lib/rotulos';

import type { PerfilUsuario } from '../types/usuarioTypes';

type UsuariosFiltersProps = {
  perfil?: PerfilUsuario;
  ativo?: boolean;
  onPerfilChange: (perfil?: PerfilUsuario) => void;
  onAtivoChange: (ativo?: boolean) => void;
};

const perfilOptions = Object.keys(rotuloDoPerfil) as PerfilUsuario[];

export function UsuariosFilters({
  ativo,
  onAtivoChange,
  onPerfilChange,
  perfil,
}: UsuariosFiltersProps) {
  return (
    <div className="mb-4 grid gap-3 rounded-md border border-line bg-surface-muted p-4 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium text-fg">
        <span>Perfil</span>
        <select
          value={perfil ?? ''}
          onChange={(event) =>
            onPerfilChange(event.target.value ? (event.target.value as PerfilUsuario) : undefined)
          }
          className="h-10 w-full rounded-md border pointer-coarse:h-11 border-line-strong bg-surface px-3 text-sm text-fg"
        >
          <option value="">Todos</option>
          {perfilOptions.map((option) => (
            <option key={option} value={option}>
              {rotuloDoPerfil[option]}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-fg">
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
          className="h-10 w-full rounded-md border pointer-coarse:h-11 border-line-strong bg-surface px-3 text-sm text-fg"
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </label>
    </div>
  );
}
