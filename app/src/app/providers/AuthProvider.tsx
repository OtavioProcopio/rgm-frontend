import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';

import { AuthContext, type AuthContextValue } from '@/app/providers/authContext';
import { authApi } from '@/features/auth/api/authApi';
import type { AuthUser, LoginRequest } from '@/features/auth/types/authTypes';
import { authToken } from '@/shared/api/authToken';
import { getDefaultRoute } from '@/shared/lib/permissions';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => authToken.getUser<AuthUser>());
  const [versaoDaSessao, setVersaoDaSessao] = useState(0);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data);
    const authenticatedUser = {
      nome: response.nome,
      perfil: response.perfil,
    };

    authToken.setTokens(response.token, response.refreshToken);
    authToken.setUser(authenticatedUser);
    setUser(authenticatedUser);
    window.location.assign(getDefaultRoute(authenticatedUser.perfil));
  }, []);

  const logout = useCallback(() => {
    authToken.clearSession();
    setUser(null);
    window.location.assign('/login');
  }, []);

  const renovarCredenciais = useCallback((token: string, refreshToken: string) => {
    authToken.setTokens(token, refreshToken);
    setVersaoDaSessao((versao) => versao + 1);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && authToken.getAccessToken()),
      login,
      logout,
      renovarCredenciais,
      versaoDaSessao,
    }),
    [login, logout, renovarCredenciais, user, versaoDaSessao],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
