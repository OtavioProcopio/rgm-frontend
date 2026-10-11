import type { Maquina } from '@/features/admin/modelos/types/maquinaTypes';
import { Card } from '@/shared/components/Card/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/components/Table/Table';

import { MaquinaActionsMenu } from './MaquinaActionsMenu';
import { MaquinaStatusBadge } from './MaquinaStatusBadge';

type MaquinasTableProps = {
  maquinas: Maquina[];
  isMutating?: boolean;
  onAtivar: (maquina: Maquina) => void;
  onDesativar: (maquina: Maquina) => void;
};

export function MaquinasTable({ isMutating, maquinas, onAtivar, onDesativar }: MaquinasTableProps) {
  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {maquinas.map((maquina) => (
          <Card as="article" key={maquina.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-fg">{maquina.nome}</h2>
              <MaquinaStatusBadge ativo={maquina.ativo} />
            </div>
            <div className="mt-4">
              <MaquinaActionsMenu
                maquina={maquina}
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
          {maquinas.map((maquina) => (
            <TableRow key={maquina.id}>
              <TableCell className="font-medium text-fg">{maquina.nome}</TableCell>
              <TableCell>
                <MaquinaStatusBadge ativo={maquina.ativo} />
              </TableCell>
              <TableCell>
                <MaquinaActionsMenu
                  maquina={maquina}
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
