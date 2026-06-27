/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UsuariosTable } from './UsuariosTable';

vi.mock('./UsuarioActionsMenu', () => ({
  UsuarioActionsMenu: () => <div data-testid="actions-menu" />,
}));
vi.mock('./UsuarioPerfilBadge', () => ({
  UsuarioPerfilBadge: ({ perfil }: { perfil: string }) => <span>{perfil}</span>,
}));
vi.mock('./UsuarioStatusBadge', () => ({
  UsuarioStatusBadge: ({ ativo }: { ativo: boolean }) => <span>{ativo ? 'Ativo' : 'Inativo'}</span>,
}));

const usuario = {
  id: '1', nome: 'João Silva', email: 'j@j.com', perfil: 'OPERADOR' as const, ativo: true,
  criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-01-01T00:00:00Z',
};

afterEach(cleanup);

describe('UsuariosTable', () => {
  it('renders usuario items', () => {
    const { container } = render(
      <UsuariosTable
        usuarios={[usuario]}
        onAtivar={vi.fn()}
        onDesativar={vi.fn()}
        onExcluir={vi.fn()}
      />,
    );
    expect(within(container).getAllByText('João Silva').length).toBeGreaterThan(0);
  });

  it('renders empty when no usuarios', () => {
    const { container } = render(
      <UsuariosTable usuarios={[]} onAtivar={vi.fn()} onDesativar={vi.fn()} onExcluir={vi.fn()} />,
    );
    expect(within(container).queryByText('João Silva')).toBeNull();
  });
});
