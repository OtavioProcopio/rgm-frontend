import { Link } from 'react-router';

import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';
import { Badge } from '@/shared/components/Badge/Badge';
import { Card } from '@/shared/components/Card/Card';

type Props = {
  modelo: Modelo;
  linkBase?: string;
};

export function ModeloCard({ modelo, linkBase = '/app/modelos' }: Props) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      {modelo.fotoCapaUrl ? (
        <img src={modelo.fotoCapaUrl} alt={modelo.codigo} className="h-36 w-full object-cover" />
      ) : (
        <div className="flex h-36 w-full items-center justify-center bg-surface-muted">
          <span className="text-3xl font-bold text-fg-muted">{modelo.codigo.slice(0, 2)}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <p className="font-semibold text-fg">{modelo.codigo}</p>
        <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{modelo.descricao}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant={modelo.ativo ? 'success' : 'neutral'}>
            {modelo.ativo ? 'Ativo' : 'Inativo'}
          </Badge>
          {modelo.temPendenciaAberta ? <Badge variant="warning">Pendência aberta</Badge> : null}
        </div>
        <Link
          to={`${linkBase}/${modelo.id}`}
          className="mt-auto inline-flex items-end pt-3 text-xs font-medium pointer-coarse:min-h-11 text-accent transition-colors hover:underline"
        >
          Ver detalhes →
        </Link>
      </div>
    </Card>
  );
}
