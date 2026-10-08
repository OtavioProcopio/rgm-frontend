import { Card } from '@/shared/components/Card/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/components/Table/Table';

import { UsuarioActionsMenu } from './UsuarioActionsMenu';
import { UsuarioPerfilBadge } from './UsuarioPerfilBadge';
import { UsuarioStatusBadge } from './UsuarioStatusBadge';
import type { Usuario } from '../types/usuarioTypes';

type UsuariosTableProps = {
  usuarios: Usuario[];
  isMutating?: boolean;
  onAtivar: (usuario: Usuario) => void;
  onDesativar: (usuario: Usuario) => void;
  onExcluir: (usuario: Usuario) => void;
};

export function UsuariosTable({
  isMutating,
  onAtivar,
  onDesativar,
  onExcluir,
  usuarios,
}: UsuariosTableProps) {
  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {usuarios.map((usuario) => (
          <Card as="article" key={usuario.id} className="rounded-md p-4 shadow-none">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-fg">{usuario.nome}</h2>
                <p className="mt-1 text-sm text-fg-muted">{usuario.email ?? 'Não possui login'}</p>
              </div>
              <UsuarioStatusBadge ativo={usuario.ativo} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <UsuarioPerfilBadge perfil={usuario.perfil} />
              <span className="text-xs text-fg-muted">
                Criado em {formatDate(usuario.criadoEm)}
              </span>
            </div>
            <div className="mt-4">
              <UsuarioActionsMenu
                usuario={usuario}
                isMutating={isMutating}
                onAtivar={onAtivar}
                onDesativar={onDesativar}
                onExcluir={onExcluir}
              />
            </div>
          </Card>
        ))}
      </div>

      <Table className="hidden lg:block">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Nome</TableHeaderCell>
            <TableHeaderCell>E-mail</TableHeaderCell>
            <TableHeaderCell>Perfil</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Criado em</TableHeaderCell>
            <TableHeaderCell>Ações</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map((usuario) => (
            <TableRow key={usuario.id}>
              <TableCell className="font-medium text-fg">{usuario.nome}</TableCell>
              <TableCell className="text-fg-muted">{usuario.email ?? 'Não possui login'}</TableCell>
              <TableCell>
                <UsuarioPerfilBadge perfil={usuario.perfil} />
              </TableCell>
              <TableCell>
                <UsuarioStatusBadge ativo={usuario.ativo} />
              </TableCell>
              <TableCell className="text-fg-muted">{formatDate(usuario.criadoEm)}</TableCell>
              <TableCell>
                <UsuarioActionsMenu
                  usuario={usuario}
                  isMutating={isMutating}
                  onAtivar={onAtivar}
                  onDesativar={onDesativar}
                  onExcluir={onExcluir}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}
