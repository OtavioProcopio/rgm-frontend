import { env } from '@/shared/config/env';

import type { RefreshTokenResponse } from '@/features/auth/types/authTypes';

import { ApiError } from './apiError';
import { authToken } from './authToken';

type QueryParams = Record<string, string | number | boolean | null | undefined>;

type RequestOptions = RequestInit & {
  params?: QueryParams;
  skipAuthRefresh?: boolean;
};

let refreshPromise: Promise<RefreshTokenResponse> | null = null;

function buildUrl(path: string, params?: QueryParams) {
  const baseUrl = env.apiBaseUrl.endsWith('/') ? env.apiBaseUrl.slice(0, -1) : env.apiBaseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function shouldSkipRefresh(path: string, skipAuthRefresh?: boolean) {
  return skipAuthRefresh || path === '/auth/login' || path === '/auth/refresh';
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  if (contentType?.includes('application/pdf')) {
    return response.blob();
  }

  return response.text();
}

async function refreshAccessToken() {
  const refreshToken = authToken.getRefreshToken();

  if (!refreshToken) {
    throw new ApiError({
      status: 401,
      message: 'Sessão expirada.',
    });
  }

  refreshPromise ??= fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new ApiError({
          status: response.status,
          message: 'Sessão expirada.',
          body: await readResponseBody(response).catch(() => null),
        });
      }

      return response.json() as Promise<RefreshTokenResponse>;
    })
    .then((tokens) => {
      authToken.setTokens(tokens.token, tokens.refreshToken);
      return tokens;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
  hasRetried = false,
): Promise<T> {
  const token = authToken.getAccessToken();
  const { params, headers, skipAuthRefresh, ...requestOptions } = options;
  const isFormData = requestOptions.body instanceof FormData;

  let response: Response;
  try {
    const requestUrl = buildUrl(path, params);
    response = await fetch(requestUrl, {
      ...requestOptions,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch (err) {
    console.error('[FETCH NETWORK ERROR]', err);
    throw err;
  }

  if (response.status === 401 && !hasRetried && !shouldSkipRefresh(path, skipAuthRefresh)) {
    try {
      await refreshAccessToken();
      return request<T>(path, options, true);
    } catch (error) {
      authToken.clearSession();
      redirectToLogin();
      throw error;
    }
  }

  if (!response.ok) {
    const body = await readResponseBody(response).catch(() => null);
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String(body.message)
        : 'Erro inesperado na comunicação com a API.';

    const apiError = new ApiError({
      status: response.status,
      message,
      body,
    });
    console.error('[API ERROR]', {
      status: apiError.status,
      message: apiError.message,
      body: apiError.body,
    });
    throw apiError;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return readResponseBody(response) as Promise<T>;
}

function buildBody(body?: unknown) {
  if (body instanceof FormData) {
    return body;
  }

  return body === undefined ? undefined : JSON.stringify(body);
}

export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: buildBody(body),
    }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: buildBody(body),
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: buildBody(body),
    }),

  delete: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'DELETE',
      body: buildBody(body),
    }),
};
