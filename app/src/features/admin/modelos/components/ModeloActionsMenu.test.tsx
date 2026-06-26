/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ModeloActionsMenu } from './ModeloActionsMenu';

const modelo = {
  id: '1', codigo: 'M01', descricao: 'Desc', maquinaId: 'm1',
  ativo: true, fotoUrl: null, criadoEm: '', atualizadoEm: '',
};

afterEach(cleanup);

describe('ModeloActionsMenu', () => {
  it('renders Detalhes and Editar links', () => {
    const { container } = render(
      <MemoryRouter><ModeloActionsMenu modelo={modelo} onDesativar={vi.fn()} onAtivar={vi.fn()} /></MemoryRouter>,
    );
    expect(within(container).getByText('Detalhes')).toBeDefined();
    expect(within(container).getByText('Editar')).toBeDefined();
  });

  it('renders Desativar button when modelo is ativo', () => {
    const { container } = render(
      <MemoryRouter><ModeloActionsMenu modelo={modelo} onDesativar={vi.fn()} onAtivar={vi.fn()} /></MemoryRouter>,
    );
    expect(within(container).getByText('Desativar')).toBeDefined();
  });

  it('renders Ativar button when modelo is inactive', () => {
    const { container } = render(
      <MemoryRouter><ModeloActionsMenu modelo={{ ...modelo, ativo: false }} onDesativar={vi.fn()} onAtivar={vi.fn()} /></MemoryRouter>,
    );
    expect(within(container).getByText('Ativar')).toBeDefined();
  });

  it('calls onDesativar when Desativar is clicked', async () => {
    const onDesativar = vi.fn();
    const { container } = render(
      <MemoryRouter><ModeloActionsMenu modelo={modelo} onDesativar={onDesativar} onAtivar={vi.fn()} /></MemoryRouter>,
    );
    await userEvent.click(within(container).getByText('Desativar'));
    expect(onDesativar).toHaveBeenCalledWith(modelo);
  });

  it('calls onAtivar when Ativar is clicked', async () => {
    const onAtivar = vi.fn();
    const { container } = render(
      <MemoryRouter><ModeloActionsMenu modelo={{ ...modelo, ativo: false }} onDesativar={vi.fn()} onAtivar={onAtivar} /></MemoryRouter>,
    );
    await userEvent.click(within(container).getByText('Ativar'));
    expect(onAtivar).toHaveBeenCalled();
  });
});
