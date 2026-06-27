/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UsuarioActionsMenu } from './UsuarioActionsMenu';

vi.mock('@/features/auth/hooks/usePerfil', () => ({
  usePerfil: vi.fn().mockReturnValue({ data: { id: 'current-user' } }),
}));

const usuario = {
  id: '1', nome: 'João', email: 'j@j.com', perfil: 'OPERADOR' as const,
  ativo: true, criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-01-01T00:00:00Z',
};

afterEach(cleanup);

describe('UsuarioActionsMenu', () => {
  it('renders Editar link and action buttons', () => {
    const { container } = render(
      <MemoryRouter>
        <UsuarioActionsMenu usuario={usuario} onAtivar={vi.fn()} onDesativar={vi.fn()} onExcluir={vi.fn()} />
      </MemoryRouter>,
    );
    expect(within(container).getByText('Editar')).toBeDefined();
    expect(within(container).getByText('Desativar')).toBeDefined();
    expect(within(container).getByText('Excluir')).toBeDefined();
  });

  it('renders Ativar when usuario is inactive', () => {
    const { container } = render(
      <MemoryRouter>
        <UsuarioActionsMenu usuario={{ ...usuario, ativo: false }} onAtivar={vi.fn()} onDesativar={vi.fn()} onExcluir={vi.fn()} />
      </MemoryRouter>,
    );
    expect(within(container).getByText('Ativar')).toBeDefined();
  });

  it('calls onDesativar when clicked', async () => {
    const onDesativar = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <UsuarioActionsMenu usuario={usuario} onAtivar={vi.fn()} onDesativar={onDesativar} onExcluir={vi.fn()} />
      </MemoryRouter>,
    );
    await userEvent.click(within(container).getByText('Desativar'));
    expect(onDesativar).toHaveBeenCalledWith(usuario);
  });

  it('calls onExcluir when clicked', async () => {
    const onExcluir = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <UsuarioActionsMenu usuario={usuario} onAtivar={vi.fn()} onDesativar={vi.fn()} onExcluir={onExcluir} />
      </MemoryRouter>,
    );
    await userEvent.click(within(container).getByText('Excluir'));
    expect(onExcluir).toHaveBeenCalledWith(usuario);
  });
});
