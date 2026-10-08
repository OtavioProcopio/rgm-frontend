/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UsuariosFilters } from '@/features/admin/usuarios/components/UsuariosFilters';
import { rotuloDoPerfil } from '@/shared/lib/rotulos';

afterEach(cleanup);

describe('UsuariosFilters', () => {
  it('renders perfil and status selects', () => {
    const { container } = render(
      <UsuariosFilters onPerfilChange={vi.fn()} onAtivoChange={vi.fn()} />,
    );
    expect(within(container).getByText('Perfil')).toBeDefined();
    expect(within(container).getByText('Status')).toBeDefined();
  });

  it.each(Object.entries(rotuloDoPerfil))(
    'deve mostrar o rótulo da fonte única quando a opção de perfil é %s',
    (perfil, rotulo) => {
      // Arrange
      const { container } = render(
        <UsuariosFilters onPerfilChange={vi.fn()} onAtivoChange={vi.fn()} />,
      );

      // Act
      const opcao = container.querySelector(`option[value="${perfil}"]`);

      // Assert
      expect(opcao?.textContent).toBe(rotulo);
    },
  );

  it('renders status options', () => {
    const { container } = render(
      <UsuariosFilters onPerfilChange={vi.fn()} onAtivoChange={vi.fn()} />,
    );
    expect(within(container).getByText('Ativos')).toBeDefined();
    expect(within(container).getByText('Inativos')).toBeDefined();
  });
});
