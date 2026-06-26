/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UsuariosFilters } from './UsuariosFilters';

afterEach(cleanup);

describe('UsuariosFilters', () => {
  it('renders perfil and status selects', () => {
    const { container } = render(
      <UsuariosFilters onPerfilChange={vi.fn()} onAtivoChange={vi.fn()} />,
    );
    expect(within(container).getByText('Perfil')).toBeDefined();
    expect(within(container).getByText('Status')).toBeDefined();
  });

  it('renders perfil options', () => {
    const { container } = render(
      <UsuariosFilters onPerfilChange={vi.fn()} onAtivoChange={vi.fn()} />,
    );
    expect(within(container).getByText('Administrador')).toBeDefined();
    expect(within(container).getByText('Gestor')).toBeDefined();
    expect(within(container).getByText('Operador')).toBeDefined();
    expect(within(container).getByText('Externo')).toBeDefined();
  });

  it('renders status options', () => {
    const { container } = render(
      <UsuariosFilters onPerfilChange={vi.fn()} onAtivoChange={vi.fn()} />,
    );
    expect(within(container).getByText('Ativos')).toBeDefined();
    expect(within(container).getByText('Inativos')).toBeDefined();
  });
});
