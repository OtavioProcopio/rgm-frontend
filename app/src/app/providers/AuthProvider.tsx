import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';

import { AuthContext, type AuthContextValue } from '@/app/providers/authContext';
import { authApi } from '@/features/auth/api/authApi';
import type { AuthUser, LoginRequest } from '@/features/auth/types/authTypes';
import { authToken } from '@/shared/api/authToken';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => authToken.getUser<AuthUser>());

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data);
    const authenticatedUser = {
      nome: response.nome,
      perfil: response.perfil,
    };

    authToken.setTokens(response.token, response.refreshToken);
    authToken.setUser(authenticatedUser);
    setUser(authenticatedUser);
    window.location.assign('/app');
  }, []);

  const logout = useCallback(() => {
    authToken.clearSession();
    setUser(null);
    window.location.assign('/login');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && authToken.getAccessToken()),
      login,
      logout,
    }),
    [login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
