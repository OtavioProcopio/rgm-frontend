import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

import { AuthContext, type AuthContextValue } from '@/app/providers/authContext';
import type { AuthUser } from '@/features/auth/types/authTypes';

const DEFAULT_USER: AuthUser = { nome: 'Teste', perfil: 'ADMINISTRADOR' };

const DEFAULT_AUTH: AuthContextValue = {
  user: DEFAULT_USER,
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
};

type AppWrapperOptions = {
  user?: AuthUser | null;
  initialEntries?: string[];
  authOverrides?: Partial<AuthContextValue>;
};

export function createAppWrapper({ user = DEFAULT_USER, initialEntries = ['/'], authOverrides }: AppWrapperOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const authValue: AuthContextValue = {
    ...DEFAULT_AUTH,
    user,
    isAuthenticated: Boolean(user),
    ...authOverrides,
  };

  function AppWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  }

  return { AppWrapper, queryClient };
}
