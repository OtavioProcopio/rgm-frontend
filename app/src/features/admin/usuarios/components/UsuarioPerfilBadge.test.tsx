/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { UsuarioPerfilBadge } from './UsuarioPerfilBadge';

afterEach(cleanup);

describe('UsuarioPerfilBadge', () => {
  it('renders Administrador', () => {
    const { container } = render(<UsuarioPerfilBadge perfil="ADMINISTRADOR" />);
    expect(within(container).getByText('Administrador')).toBeDefined();
  });

  it('renders Gestor', () => {
    const { container } = render(<UsuarioPerfilBadge perfil="GESTOR" />);
    expect(within(container).getByText('Gestor')).toBeDefined();
  });

  it('renders Operador', () => {
    const { container } = render(<UsuarioPerfilBadge perfil="OPERADOR" />);
    expect(within(container).getByText('Operador')).toBeDefined();
  });

  it('renders Externo', () => {
    const { container } = render(<UsuarioPerfilBadge perfil="EXTERNO" />);
    expect(within(container).getByText('Externo')).toBeDefined();
  });
});
