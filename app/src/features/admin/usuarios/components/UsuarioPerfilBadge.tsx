import { cn } from '@/shared/lib/cn';

import type { PerfilUsuario } from '../types/usuarioTypes';

const perfilLabels: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: 'Administrador',
  GESTOR: 'Gestor',
  OPERADOR: 'Operador',
  EXTERNO: 'Externo',
};

type UsuarioPerfilBadgeProps = {
  perfil: PerfilUsuario;
};

export function UsuarioPerfilBadge({ perfil }: UsuarioPerfilBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-1 text-xs font-semibold',
        perfil === 'ADMINISTRADOR' &&
          'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950',
        perfil === 'GESTOR' && 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
        perfil === 'OPERADOR' &&
          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
        perfil === 'EXTERNO' &&
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      )}
    >
      {perfilLabels[perfil]}
    </span>
  );
}
