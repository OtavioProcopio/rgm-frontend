import { createContext, useContext } from 'react';

import type { AuthUser, LoginRequest } from '@/features/auth/types/authTypes';

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
