import type { TipoDeModelo } from '@/features/admin/modelos/types/tipoModeloTypes';
import { Card } from '@/shared/components/Card/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/components/Table/Table';

import { TipoModeloActionsMenu } from './TipoModeloActionsMenu';
import { TipoModeloStatusBadge } from './TipoModeloStatusBadge';

type TiposModeloTableProps = {
  tiposModelo: TipoDeModelo[];
  isMutating?: boolean;
  onAtivar: (tipoModelo: TipoDeModelo) => void;
  onDesativar: (tipoModelo: TipoDeModelo) => void;
};

export function TiposModeloTable({
  isMutating,
  tiposModelo,
  onAtivar,
  onDesativar,
}: TiposModeloTableProps) {
  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {tiposModelo.map((tipoModelo) => (
          <Card as="article" key={tipoModelo.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-fg">{tipoModelo.nome}</h2>
              <TipoModeloStatusBadge ativo={tipoModelo.ativo} />
            </div>
            <div className="mt-4">
              <TipoModeloActionsMenu
                tipoModelo={tipoModelo}
                isMutating={isMutating}
                onAtivar={onAtivar}
                onDesativar={onDesativar}
              />
            </div>
          </Card>
        ))}
      </div>

      <Table className="hidden lg:block">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Nome</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Ações</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tiposModelo.map((tipoModelo) => (
            <TableRow key={tipoModelo.id}>
              <TableCell className="font-medium text-fg">{tipoModelo.nome}</TableCell>
              <TableCell>
                <TipoModeloStatusBadge ativo={tipoModelo.ativo} />
              </TableCell>
              <TableCell>
                <TipoModeloActionsMenu
                  tipoModelo={tipoModelo}
                  isMutating={isMutating}
                  onAtivar={onAtivar}
                  onDesativar={onDesativar}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
