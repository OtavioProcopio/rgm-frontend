/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { AuthContext, type AuthContextValue } from '@/app/providers/authContext';

import { AdminRoute } from '@/app/routes/AdminRoute';
import { ModeloManagementRoute } from '@/app/routes/ModeloManagementRoute';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/app/routes/PublicOnlyRoute';

afterEach(cleanup);

const authValue = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
  user: { nome: 'A', perfil: 'ADMINISTRADOR' },
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
  renovarCredenciais: () => {},
  versaoDaSessao: 0,
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
    const { container } = wrap(<ProtectedRoute />, authValue());
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

describe('rotas — aviso de acesso negado nas cores do tema', () => {
  const OPERADOR = authValue({ user: { nome: 'Op', perfil: 'OPERADOR' } });
  const AVISOS: [string, React.ReactNode, string][] = [
    [
      'ProtectedRoute',
      <ProtectedRoute allowedProfiles={['ADMINISTRADOR']} />,
      'Seu perfil não possui acesso a esta área no frontend.',
    ],
    ['AdminRoute', <AdminRoute />, 'Seu perfil não possui permissão para acessar esta área.'],
    [
      'ModeloManagementRoute',
      <ModeloManagementRoute />,
      'Seu perfil não possui permissão para gerenciar modelos.',
    ],
  ];

  it.each(AVISOS)(
    'deve pintar o aviso com o papel de alerta em %s quando o perfil não tem acesso',
    (_rota, elemento) => {
      // Arrange
      const papeisDeAlerta = ['border-warning', 'bg-warning-soft', 'text-warning-fg'];

      // Act
      wrap(elemento, OPERADOR);

      // Assert
      const aviso = screen.getByRole('heading', { name: 'Acesso negado' }).closest('section');
      expect(aviso?.className.split(' ')).toEqual(expect.arrayContaining(papeisDeAlerta));
    },
  );

  it.each(AVISOS)(
    'deve explicar a recusa em %s quando o perfil não tem acesso',
    (_rota, elemento, explicacao) => {
      // Act
      wrap(elemento, OPERADOR);

      // Assert
      expect(screen.getByText(explicacao).closest('section')).toBe(
        screen.getByRole('heading', { name: 'Acesso negado' }).closest('section'),
      );
    },
  );
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
