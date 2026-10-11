/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MaquinaActionsMenu } from '@/features/admin/maquinas/components/MaquinaActionsMenu';

const maquina = { id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' };

afterEach(cleanup);

describe('MaquinaActionsMenu', () => {
  it('renders a link to rename the machine', () => {
    const { container } = render(
      <MemoryRouter>
        <MaquinaActionsMenu maquina={maquina} onAtivar={vi.fn()} onDesativar={vi.fn()} />
      </MemoryRouter>,
    );
    const link = within(container).getByText('Renomear');
    expect(link.getAttribute('href')).toBe('/app/admin/maquinas/1/editar');
  });

  it('calls onDesativar for an active machine', async () => {
    const onDesativar = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <MaquinaActionsMenu maquina={maquina} onAtivar={vi.fn()} onDesativar={onDesativar} />
      </MemoryRouter>,
    );
    await userEvent.click(within(container).getByText('Desativar'));
    expect(onDesativar).toHaveBeenCalledWith(maquina);
  });

  it('calls onAtivar for an inactive machine', async () => {
    const onAtivar = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <MaquinaActionsMenu
          maquina={{ ...maquina, ativo: false }}
          onAtivar={onAtivar}
          onDesativar={vi.fn()}
        />
      </MemoryRouter>,
    );
    await userEvent.click(within(container).getByText('Ativar'));
    expect(onAtivar).toHaveBeenCalledWith({ ...maquina, ativo: false });
  });

  it('deve mostrar o link Renomear com superfície suave e texto principal pelos papéis', () => {
    // Arrange
    const botaoSecundario = ['bg-surface-muted', 'text-fg'];

    // Act
    render(
      <MemoryRouter>
        <MaquinaActionsMenu
          maquina={maquina}
          onAtivar={vi.fn<(alvo: typeof maquina) => void>()}
          onDesativar={vi.fn<(alvo: typeof maquina) => void>()}
        />
      </MemoryRouter>,
    );

    // Assert
    const link = screen.getByRole('link', { name: 'Renomear' });
    expect(link.className.split(' ')).toEqual(expect.arrayContaining(botaoSecundario));
  });
});
