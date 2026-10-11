import { Badge } from '@/shared/components/Badge/Badge';

type TipoModeloStatusBadgeProps = {
  ativo: boolean;
};

export function TipoModeloStatusBadge({ ativo }: TipoModeloStatusBadgeProps) {
  return <Badge variant={ativo ? 'success' : 'neutral'}>{ativo ? 'Ativo' : 'Inativo'}</Badge>;
}
