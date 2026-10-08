import { Badge } from '@/shared/components/Badge/Badge';

type UsuarioStatusBadgeProps = {
  ativo: boolean;
};

export function UsuarioStatusBadge({ ativo }: UsuarioStatusBadgeProps) {
  return <Badge variant={ativo ? 'success' : 'neutral'}>{ativo ? 'Ativo' : 'Inativo'}</Badge>;
}
