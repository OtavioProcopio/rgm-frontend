import { createContext, useContext } from 'react';

import type { AuthUser, LoginRequest } from '@/features/auth/types/authTypes';

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  /** Troca as credenciais da sessão em uso, sem novo login (troca da própria senha). */
  renovarCredenciais: (token: string, refreshToken: string) => void;
  /** Sobe a cada troca de credenciais; quem mantém conexão autenticada reabre ao vê-la mudar. */
  versaoDaSessao: number;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
