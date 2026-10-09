import { Link } from 'react-router';

import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';
import { Badge } from '@/shared/components/Badge/Badge';
import { Card } from '@/shared/components/Card/Card';

type Props = {
  modelo: Modelo;
  linkBase?: string;
};

function Capa({ modelo }: { modelo: Modelo }) {
  if (modelo.fotoCapaUrl) {
    return <img src={modelo.fotoCapaUrl} alt="" className="aspect-[4/3] w-full object-cover" />;
  }
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center bg-surface-muted">
      <span className="text-3xl font-bold text-fg-muted">{modelo.codigo.slice(0, 2)}</span>
    </div>
  );
}

function Selos({ modelo }: { modelo: Modelo }) {
  if (modelo.ativo && !modelo.temPendenciaAberta) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {modelo.ativo ? null : <Badge variant="neutral">Inativo</Badge>}
      {modelo.temPendenciaAberta ? <Badge variant="warning">Pendência aberta</Badge> : null}
    </div>
  );
}

export function ModeloCard({ modelo, linkBase = '/app/modelos' }: Props) {
  return (
    <Link
      to={`${linkBase}/${modelo.id}`}
      aria-label={`${modelo.descricao}, ${modelo.codigo}`}
      className="block"
    >
      <Card className="flex flex-col overflow-hidden hover:shadow-md motion-safe:transition-shadow">
        <Capa modelo={modelo} />
        <div className="flex flex-1 flex-col p-4">
          <p className="line-clamp-2 font-semibold text-fg">{modelo.descricao}</p>
          <p className="mt-1 font-mono text-xs text-fg-muted">{modelo.codigo}</p>
          <Selos modelo={modelo} />
        </div>
      </Card>
    </Link>
  );
}
