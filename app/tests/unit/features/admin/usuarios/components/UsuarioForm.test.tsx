/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UsuarioForm } from '@/features/admin/usuarios/components/UsuarioForm';
import type { PerfilUsuario } from '@/features/admin/usuarios/types/usuarioTypes';
import { LIMITES } from '@/shared/lib/limites';
import { rotuloDoPerfil } from '@/shared/lib/rotulos';

const baseUsuario = {
  id: '1',
  nome: 'João Silva',
  email: 'joao@empresa.com',
  perfil: 'OPERADOR' as const,
  ativo: true,
  criadoEm: '2024-01-01T00:00:00Z',
  atualizadoEm: '2024-01-01T00:00:00Z',
};
const PERFIS = Object.entries(rotuloDoPerfil) as [PerfilUsuario, string][];

afterEach(cleanup);

describe('UsuarioForm (create)', () => {
  it('renders create form fields', () => {
    const { container } = render(<UsuarioForm mode="create" onSubmit={vi.fn()} />);
    expect(within(container).getByLabelText(/nome/i)).toBeDefined();
    expect(within(container).getByLabelText(/e-mail/i)).toBeDefined();
    expect(within(container).getByLabelText(/senha/i)).toBeDefined();
  });

  it.each(PERFIS)(
    'deve mostrar o rótulo da fonte única quando a opção de perfil é %s',
    (perfil, rotulo) => {
      // Arrange
      const { container } = render(<UsuarioForm mode="create" onSubmit={vi.fn()} />);

      // Act
      const opcao = container.querySelector(`select option[value="${perfil}"]`);

      // Assert
      expect(opcao?.textContent).toBe(rotulo);
    },
  );

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
    const { container } = render(<UsuarioForm mode="create" onSubmit={vi.fn()} isSubmitting />);
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

  it.each(PERFIS)(
    'deve mostrar o rótulo da fonte única no campo de leitura quando o perfil do usuário é %s',
    (perfil, rotulo) => {
      // Arrange
      const usuario = { ...baseUsuario, perfil };

      // Act
      const { container } = render(
        <UsuarioForm mode="edit" usuario={usuario} onSubmit={vi.fn()} />,
      );

      // Assert
      expect(within(container).queryByText(rotulo)).not.toBeNull();
    },
  );

  it('deve mostrar a situação Ativo no campo de leitura quando o usuário está ativo', () => {
    // Arrange
    const usuario = { ...baseUsuario, ativo: true };

    // Act
    const { container } = render(<UsuarioForm mode="edit" usuario={usuario} onSubmit={vi.fn()} />);

    // Assert
    expect(within(container).queryByText('Ativo')).not.toBeNull();
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

describe('UsuarioForm — limite de texto', () => {
  it.each([
    ['create', /nome/i, 'usuarioNome'],
    ['create', /e-mail/i, 'usuarioEmail'],
    ['edit', /nome/i, 'usuarioNome'],
    ['edit', /e-mail/i, 'usuarioEmail'],
  ] as const)('deve limitar o campo no modo %s quando o rótulo é %s', (modo, rotulo, limite) => {
    // Arrange
    const esperado = LIMITES[limite];

    // Act
    const { container } = render(
      modo === 'create' ? (
        <UsuarioForm mode="create" onSubmit={vi.fn()} />
      ) : (
        <UsuarioForm mode="edit" usuario={baseUsuario} onSubmit={vi.fn()} />
      ),
    );
    const campo = within(container).getByLabelText(rotulo) as HTMLInputElement;

    // Assert
    expect(campo.maxLength).toBe(esperado);
  });
});
