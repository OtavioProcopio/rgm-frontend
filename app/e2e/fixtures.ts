import { test as base, type Page, type APIRequestContext } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@rgm.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';
const API_URL = process.env.API_URL ?? 'http://localhost:8080/api';

export { ADMIN_EMAIL, ADMIN_PASSWORD, API_URL };

// ── API client ───────────────────────────────────────────────────────────────

export async function apiLogin(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email: ADMIN_EMAIL, senha: ADMIN_PASSWORD },
  });
  const body = await res.json();
  return body.token as string;
}

export async function apiPost<T>(
  request: APIRequestContext,
  path: string,
  data: Record<string, unknown>,
  token: string,
): Promise<T> {
  const res = await request.post(`${API_URL}${path}`, {
    data,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<T>;
}

export async function apiPatch(
  request: APIRequestContext,
  path: string,
  data: Record<string, unknown> | null,
  token: string,
): Promise<void> {
  await request.patch(`${API_URL}${path}`, {
    data: data ?? {},
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Login fixture ────────────────────────────────────────────────────────────

async function loginAdmin(page: Page, goTo = '/app/solicitacoes') {
  const res = await page.request.post(`${API_URL}/auth/login`, {
    data: { email: ADMIN_EMAIL, senha: ADMIN_PASSWORD },
  });
  const body = await res.json();

  await page.goto('/');
  await page.evaluate(
    ({ token, refreshToken, user }) => {
      localStorage.setItem('rgm.accessToken', token);
      localStorage.setItem('rgm.refreshToken', refreshToken);
      localStorage.setItem('rgm.user', JSON.stringify(user));
    },
    {
      token: body.token,
      refreshToken: body.refreshToken,
      user: { nome: body.nome, perfil: body.perfil },
    },
  );
  await page.goto(goTo);
}

// ── Extended test with loginAdmin helper ─────────────────────────────────────

type Fixtures = {
  loginAdmin: (goTo?: string) => Promise<void>;
  token: string;
};

export const test = base.extend<Fixtures>({
  loginAdmin: async ({ page }, use) => {
    await use((goTo) => loginAdmin(page, goTo));
  },
  token: async ({ request }, use) => {
    const t = await apiLogin(request);
    await use(t);
  },
});

export { expect } from '@playwright/test';
