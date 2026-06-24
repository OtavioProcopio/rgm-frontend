/// <reference types="cypress" />

const API = () => Cypress.env('apiUrl') as string;

// Token cache — evita múltiplos logins por spec (rate limiter: 10/60s)
let _apiToken: string | null = null;

// ── Auth ─────────────────────────────────────────────────────────────────────

Cypress.Commands.add('loginAdmin', (visitUrl = '/app/solicitacoes') => {
  cy.session(
    'admin',
    () => {
      cy.request({
        method: 'POST',
        url: `${API()}/auth/login`,
        body: { email: Cypress.env('adminEmail'), senha: Cypress.env('adminPassword') },
      }).then(({ body }) => {
        cy.visit('/', {
          onBeforeLoad: (win) => {
            win.localStorage.setItem('rgm.accessToken', body.token);
            win.localStorage.setItem('rgm.refreshToken', body.refreshToken);
            win.localStorage.setItem(
              'rgm.user',
              JSON.stringify({ nome: body.nome, perfil: body.perfil }),
            );
          },
        });
      });
    },
    { cacheAcrossSpecs: false },
  );
  cy.visit(visitUrl);
});

// ── API helpers (setup de dados de teste) ────────────────────────────────────

Cypress.Commands.add('apiLogin', () => {
  if (_apiToken) {
    return cy.wrap(_apiToken);
  }
  return cy
    .request({
      method: 'POST',
      url: `${API()}/auth/login`,
      body: { email: Cypress.env('adminEmail'), senha: Cypress.env('adminPassword') },
    })
    .then(({ body }) => {
      _apiToken = body.token as string;
      return _apiToken;
    });
});

Cypress.Commands.add(
  'apiPost',
  (path: string, body: Record<string, unknown>, token: string) => {
    return cy.request({
      method: 'POST',
      url: `${API()}${path}`,
      headers: { Authorization: `Bearer ${token}` },
      body,
      failOnStatusCode: true,
    });
  },
);

Cypress.Commands.add(
  'apiPatch',
  (path: string, body: Record<string, unknown> | null, token: string) => {
    return cy.request({
      method: 'PATCH',
      url: `${API()}${path}`,
      headers: { Authorization: `Bearer ${token}` },
      body: body ?? {},
      failOnStatusCode: true,
    });
  },
);

// ── Declarações de tipos para TypeScript ─────────────────────────────────────

declare global {
  namespace Cypress {
    interface Chainable {
      loginAdmin(visitUrl?: string): Chainable<void>;
      apiLogin(): Chainable<string>;
      apiPost(
        path: string,
        body: Record<string, unknown>,
        token: string,
      ): Chainable<Cypress.Response<unknown>>;
      apiPatch(
        path: string,
        body: Record<string, unknown> | null,
        token: string,
      ): Chainable<Cypress.Response<unknown>>;
    }
  }
}
