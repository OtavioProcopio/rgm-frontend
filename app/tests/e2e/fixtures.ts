import { test as base, type Page, type APIRequestContext } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@rgm.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';
const API_URL = process.env.API_URL ?? 'http://localhost:8080/api';

/** Máquina garantida a existir no catálogo seed (ver V3__create_maquinas_catalog.sql). */
const MAQUINA_CATALOGO = 'FBOX';

export { ADMIN_EMAIL, ADMIN_PASSWORD, API_URL, MAQUINA_CATALOGO };

// ── API client ───────────────────────────────────────────────────────────────

export async function apiLogin(
  request: APIRequestContext,
  email = ADMIN_EMAIL,
  senha = ADMIN_PASSWORD,
): Promise<string> {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email, senha },
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
  if (!res.ok()) {
    throw new Error(
      `POST ${path} falhou (${res.status()}): ${await res.text()}`,
    );
  }
  return res.json() as Promise<T>;
}

export async function apiPatch(
  request: APIRequestContext,
  path: string,
  data: Record<string, unknown> | null,
  token: string,
): Promise<void> {
  const res = await request.patch(`${API_URL}${path}`, {
    data: data ?? {},
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(
      `PATCH ${path} falhou (${res.status()}): ${await res.text()}`,
    );
  }
}

export async function apiGet<T>(
  request: APIRequestContext,
  path: string,
  token: string,
): Promise<T> {
  const res = await request.get(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(`GET ${path} falhou (${res.status()}): ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

const PNG_1X1_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/**
 * Anexa uma evidência SERVICO_REALIZADO (imagem 1x1) via API — necessário antes de
 * enviar para validação uma solicitação REPARO/INSPECAO/REENGENHARIA (o backend exige).
 */
export async function apiAnexarServicoRealizado(
  request: APIRequestContext,
  solicitacaoId: string,
  token: string,
): Promise<void> {
  const res = await request.post(`${API_URL}/solicitacoes/${solicitacaoId}/evidencias`, {
    headers: { Authorization: `Bearer ${token}` },
    multipart: {
      file: {
        name: 'servico.png',
        mimeType: 'image/png',
        buffer: Buffer.from(PNG_1X1_BASE64, 'base64'),
      },
      tipo: 'SERVICO_REALIZADO',
      descricao: 'Servico realizado (evidencia de setup E2E)',
    },
  });
  if (!res.ok()) {
    throw new Error(
      `Anexar evidencia SERVICO_REALIZADO falhou (${res.status()}): ${await res.text()}`,
    );
  }
}

type NovoUsuario = { id: string; email: string; senha: string; perfil: string };

/** Cria um usuário GESTOR ou OPERADOR único para o teste, via admin. */
export async function apiCriarUsuario(
  request: APIRequestContext,
  adminToken: string,
  perfil: 'GESTOR' | 'OPERADOR',
  ts: number,
): Promise<NovoUsuario> {
  const senha = 'senha12345';
  const email = `${perfil.toLowerCase()}.e2e.${ts}.${Math.floor(Math.random() * 1e6)}@rgm.com`;
  const usuario = await apiPost<{ id: string }>(
    request,
    '/admin/usuarios',
    { nome: `${perfil} E2E ${ts}`, email, senha, perfil },
    adminToken,
  );
  return { id: usuario.id, email, senha, perfil };
}

// ── Login fixtures ───────────────────────────────────────────────────────────

async function loginComoUsuario(page: Page, email: string, senha: string, goTo = '/app/solicitacoes') {
  const res = await page.request.post(`${API_URL}/auth/login`, {
    data: { email, senha },
  });
  if (!res.ok()) {
    throw new Error(`Login falhou para ${email}: ${res.status()} ${await res.text()}`);
  }
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

// ── Extended test with login helpers ─────────────────────────────────────────

type Fixtures = {
  loginAdmin: (goTo?: string) => Promise<void>;
  loginAs: (email: string, senha: string, goTo?: string) => Promise<void>;
  token: string;
};

export const test = base.extend<Fixtures>({
  loginAdmin: async ({ page }, use) => {
    await use((goTo) => loginComoUsuario(page, ADMIN_EMAIL, ADMIN_PASSWORD, goTo));
  },
  loginAs: async ({ page }, use) => {
    await use((email, senha, goTo) => loginComoUsuario(page, email, senha, goTo));
  },
  token: async ({ request }, use) => {
    const t = await apiLogin(request);
    await use(t);
  },
});

export { expect } from '@playwright/test';
