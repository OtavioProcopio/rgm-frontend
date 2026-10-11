import { Badge } from '@/shared/components/Badge/Badge';

type MaquinaStatusBadgeProps = {
  ativo: boolean;
};

export function MaquinaStatusBadge({ ativo }: MaquinaStatusBadgeProps) {
  return <Badge variant={ativo ? 'success' : 'neutral'}>{ativo ? 'Ativa' : 'Inativa'}</Badge>;
}
