import { httpClient } from '@/shared/api/httpClient';

import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../types/authTypes';

export const authApi = {
  login: (payload: LoginRequest) => httpClient.post<LoginResponse>('/auth/login', payload),

  refresh: (refreshToken: string) =>
    httpClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    } satisfies RefreshTokenRequest),
};
