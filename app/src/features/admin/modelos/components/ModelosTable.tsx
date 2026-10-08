import { Badge } from '@/shared/components/Badge/Badge';
import { Card } from '@/shared/components/Card/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/components/Table/Table';
import { rotuloDoTipoDeModelo } from '@/shared/lib/rotulos';

import { ModeloActionsMenu } from './ModeloActionsMenu';
import { ModeloFotoCapa } from './ModeloFotoCapa';
import { ModeloStatusBadge } from './ModeloStatusBadge';
import type { Modelo } from '../types/modeloTypes';

function TipoModeloBadge({ tipo }: { tipo: Modelo['tipo'] }) {
  if (!tipo) {
    return <span className="text-fg-muted">—</span>;
  }
  return <Badge variant="neutral">{rotuloDoTipoDeModelo[tipo]}</Badge>;
}

type ModelosTableProps = {
  modelos: Modelo[];
};

export function ModelosTable({ modelos }: ModelosTableProps) {
  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {modelos.map((modelo) => (
          <Card as="article" key={modelo.id} className="rounded-md p-4 shadow-none">
            <div className="flex gap-3">
              <ModeloFotoCapa
                fotoUrl={modelo.fotoCapaUrl}
                className="h-16 w-16 shrink-0 rounded-md"
              />
              <div className="min-w-0">
                <h2 className="font-semibold text-fg">
                  {modelo.codigo} v{modelo.versao}
                </h2>
                <p className="mt-1 text-sm text-fg-muted">{modelo.descricao}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <ModeloStatusBadge ativo={modelo.ativo} />
              <TipoModeloBadge tipo={modelo.tipo} />
              {modelo.temPendenciaAberta ? <Badge variant="warning">Pendência aberta</Badge> : null}
            </div>
            <p className="mt-3 text-sm text-fg-muted">{modelo.maquina}</p>
            <div className="mt-4">
              <ModeloActionsMenu modelo={modelo} />
            </div>
          </Card>
        ))}
      </div>
      <Table className="hidden lg:block">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Foto</TableHeaderCell>
            <TableHeaderCell>Código</TableHeaderCell>
            <TableHeaderCell>Versão</TableHeaderCell>
            <TableHeaderCell>Descrição</TableHeaderCell>
            <TableHeaderCell>Máquina</TableHeaderCell>
            <TableHeaderCell>Tipo</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Pendência</TableHeaderCell>
            <TableHeaderCell>Ações</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {modelos.map((modelo) => (
            <TableRow key={modelo.id}>
              <TableCell>
                <ModeloFotoCapa fotoUrl={modelo.fotoCapaUrl} className="h-12 w-12 rounded-md" />
              </TableCell>
              <TableCell className="font-medium text-fg">{modelo.codigo}</TableCell>
              <TableCell className="text-fg-muted">{modelo.versao}</TableCell>
              <TableCell className="max-w-[220px] truncate text-fg-muted" title={modelo.descricao}>
                {modelo.descricao}
              </TableCell>
              <TableCell className="max-w-[140px] truncate text-fg-muted" title={modelo.maquina}>
                {modelo.maquina}
              </TableCell>
              <TableCell>
                <TipoModeloBadge tipo={modelo.tipo} />
              </TableCell>
              <TableCell>
                <ModeloStatusBadge ativo={modelo.ativo} />
              </TableCell>
              <TableCell className="text-fg-muted">
                {modelo.temPendenciaAberta ? 'Sim' : 'Não'}
              </TableCell>
              <TableCell>
                <ModeloActionsMenu modelo={modelo} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
