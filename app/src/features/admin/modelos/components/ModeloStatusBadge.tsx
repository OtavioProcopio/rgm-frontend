import { Badge } from '@/shared/components/Badge/Badge';

export function ModeloStatusBadge({ ativo }: { ativo: boolean }) {
  return <Badge variant={ativo ? 'success' : 'neutral'}>{ativo ? 'Ativo' : 'Inativo'}</Badge>;
}
