/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { AuthContext, type AuthContextValue } from '@/app/providers/authContext';

import { AdminRoute } from './AdminRoute';
import { ModeloManagementRoute } from './ModeloManagementRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

afterEach(cleanup);

const authValue = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
  user: { nome: 'A', perfil: 'ADMINISTRADOR' },
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
  ...overrides,
});

function wrap(ui: React.ReactNode, auth: AuthContextValue, path = '/') {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('renders outlet when authenticated', () => {
    const { container } = wrap(
      <ProtectedRoute />,
      authValue(),
    );
    expect(container).toBeDefined();
  });

  it('shows access denied for wrong profile', () => {
    const { container } = wrap(
      <ProtectedRoute allowedProfiles={['ADMINISTRADOR']} />,
      authValue({ user: { nome: 'Op', perfil: 'OPERADOR' } }),
    );
    expect(within(container).getByText('Acesso negado')).toBeDefined();
  });

  it('redirects to login when not authenticated', () => {
    const { container } = wrap(
      <ProtectedRoute />,
      authValue({ isAuthenticated: false, user: null }),
    );
    expect(within(container).queryByText('Acesso negado')).toBeNull();
  });
});

describe('AdminRoute', () => {
  it('renders outlet for ADMINISTRADOR', () => {
    const { container } = wrap(<AdminRoute />, authValue());
    expect(within(container).queryByText('Acesso negado')).toBeNull();
  });

  it('shows access denied for OPERADOR', () => {
    const { container } = wrap(
      <AdminRoute />,
      authValue({ user: { nome: 'Op', perfil: 'OPERADOR' } }),
    );
    expect(within(container).getByText('Acesso negado')).toBeDefined();
  });
});

describe('ModeloManagementRoute', () => {
  it('renders outlet for GESTOR', () => {
    const { container } = wrap(
      <ModeloManagementRoute />,
      authValue({ user: { nome: 'G', perfil: 'GESTOR' } }),
    );
    expect(within(container).queryByText('Acesso negado')).toBeNull();
  });

  it('shows access denied for OPERADOR', () => {
    const { container } = wrap(
      <ModeloManagementRoute />,
      authValue({ user: { nome: 'Op', perfil: 'OPERADOR' } }),
    );
    expect(within(container).getByText('Acesso negado')).toBeDefined();
  });
});

describe('PublicOnlyRoute', () => {
  it('renders outlet when not authenticated', () => {
    const { container } = wrap(
      <PublicOnlyRoute />,
      authValue({ isAuthenticated: false, user: null }),
    );
    expect(within(container).queryByText('Acesso negado')).toBeNull();
  });

  it('redirects authenticated users', () => {
    const { container } = wrap(<PublicOnlyRoute />, authValue());
    expect(within(container).queryByText('Acesso negado')).toBeNull();
  });
});
