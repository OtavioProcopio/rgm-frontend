/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UsuarioForm } from './UsuarioForm';

const baseUsuario = {
  id: '1',
  nome: 'João Silva',
  email: 'joao@empresa.com',
  perfil: 'OPERADOR' as const,
  ativo: true,
  criadoEm: '2024-01-01T00:00:00Z',
  atualizadoEm: '2024-01-01T00:00:00Z',
};

afterEach(cleanup);

describe('UsuarioForm (create)', () => {
  it('renders create form fields', () => {
    const { container } = render(<UsuarioForm mode="create" onSubmit={vi.fn()} />);
    expect(within(container).getByLabelText(/nome/i)).toBeDefined();
    expect(within(container).getByLabelText(/e-mail/i)).toBeDefined();
    expect(within(container).getByLabelText(/senha/i)).toBeDefined();
  });

  it('renders perfil select', () => {
    const { container } = render(<UsuarioForm mode="create" onSubmit={vi.fn()} />);
    const select = container.querySelector('select')!;
    expect(select).toBeDefined();
    expect(within(container).getByText('Operador')).toBeDefined();
  });

  it('renders ativo checkbox', () => {
    const { container } = render(<UsuarioForm mode="create" onSubmit={vi.fn()} />);
    expect(within(container).getByText(/usuário ativo/i)).toBeDefined();
    const checkbox = container.querySelector('input[type="checkbox"]')!;
    expect(checkbox).toBeDefined();
  });

  it('renders submit button with correct label', () => {
    const { container } = render(<UsuarioForm mode="create" onSubmit={vi.fn()} />);
    expect(within(container).getByText(/salvar usuário/i)).toBeDefined();
  });

  it('shows submitting state', () => {
    const { container } = render(
      <UsuarioForm mode="create" onSubmit={vi.fn()} isSubmitting />,
    );
    expect(within(container).getByText(/salvando/i)).toBeDefined();
  });
});

describe('UsuarioForm (edit)', () => {
  it('renders edit form with pre-filled nome and email', () => {
    const { container } = render(
      <UsuarioForm mode="edit" usuario={baseUsuario} onSubmit={vi.fn()} />,
    );
    expect(within(container).getByDisplayValue('João Silva')).toBeDefined();
    expect(within(container).getByDisplayValue('joao@empresa.com')).toBeDefined();
  });

  it('shows perfil and status as read-only', () => {
    const { container } = render(
      <UsuarioForm mode="edit" usuario={baseUsuario} onSubmit={vi.fn()} />,
    );
    expect(within(container).getByText('Operador')).toBeDefined();
    expect(within(container).getByText('Ativo')).toBeDefined();
  });

  it('renders salvar alterações button', () => {
    const { container } = render(
      <UsuarioForm mode="edit" usuario={baseUsuario} onSubmit={vi.fn()} />,
    );
    expect(within(container).getByText(/salvar alterações/i)).toBeDefined();
  });

  it('shows externo warning when perfil is EXTERNO', () => {
    const { container } = render(
      <UsuarioForm
        mode="edit"
        usuario={{ ...baseUsuario, perfil: 'EXTERNO', email: null }}
        onSubmit={vi.fn()}
      />,
    );
    expect(within(container).getByText(/prestador externo/i)).toBeDefined();
  });

  it('shows inativo status', () => {
    const { container } = render(
      <UsuarioForm mode="edit" usuario={{ ...baseUsuario, ativo: false }} onSubmit={vi.fn()} />,
    );
    expect(within(container).getByText('Inativo')).toBeDefined();
  });
});
