/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TriagemModal } from './TriagemModal';

afterEach(cleanup);

describe('TriagemModal', () => {
  it('renders form fields', () => {
    const { container } = render(
      <TriagemModal usuarios={[]} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText(/triar solicitação/i)).toBeDefined();
    const selects = container.querySelectorAll('select');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('shows empty responsáveis message when no usuarios', () => {
    const { container } = render(
      <TriagemModal usuarios={[]} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText(/nenhum responsável/i)).toBeDefined();
  });

  it('renders usuario checkboxes', () => {
    const usuarios = [{ id: 'u1', nome: 'João' }, { id: 'u2', nome: 'Maria' }];
    const { container } = render(
      <TriagemModal usuarios={usuarios} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText('João')).toBeDefined();
    expect(within(container).getByText('Maria')).toBeDefined();
  });

  it('renders Cancelar and Confirmar buttons', () => {
    const { container } = render(
      <TriagemModal usuarios={[]} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText('Cancelar')).toBeDefined();
    expect(within(container).getByText('Confirmar triagem')).toBeDefined();
  });

  it('shows pending state', () => {
    const { container } = render(
      <TriagemModal usuarios={[]} isPending onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText('Triando...')).toBeDefined();
  });
});
