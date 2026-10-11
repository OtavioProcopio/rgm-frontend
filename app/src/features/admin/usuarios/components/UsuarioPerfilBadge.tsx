import { Badge, type BadgeVariant } from '@/shared/components/Badge/Badge';
import { rotuloDoPerfil } from '@/shared/lib/rotulos';

import type { PerfilUsuario } from '../types/usuarioTypes';

const variacaoDoPerfil: Record<PerfilUsuario, BadgeVariant> = {
  ADMINISTRADOR: 'accent',
  GESTOR: 'info',
  OPERADOR: 'neutral',
  EXTERNO: 'success',
};

type UsuarioPerfilBadgeProps = {
  perfil: PerfilUsuario;
};

export function UsuarioPerfilBadge({ perfil }: UsuarioPerfilBadgeProps) {
  return <Badge variant={variacaoDoPerfil[perfil]}>{rotuloDoPerfil[perfil]}</Badge>;
}
