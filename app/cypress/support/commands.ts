/// <reference types="cypress" />

const API = () => Cypress.env('apiUrl') as string;

// ── Auth ─────────────────────────────────────────────────────────────────────

Cypress.Commands.add('loginAdmin', (visitUrl = '/app/solicitacoes') => {
  cy.request({
    method: 'POST',
    url: `${API()}/auth/login`,
    body: {
      email: Cypress.env('adminEmail'),
      senha: Cypress.env('adminPassword'),
    },
  }).then(({ body }) => {
    cy.visit(visitUrl, {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('rgm.accessToken', body.token);
        win.localStorage.setItem('rgm.refreshToken', body.refreshToken);
        win.localStorage.setItem('rgm.user', JSON.stringify(body.usuario));
      },
    });
  });
});

// ── API helpers (setup de dados de teste) ────────────────────────────────────

Cypress.Commands.add('apiLogin', () => {
  return cy
    .request({
      method: 'POST',
      url: `${API()}/auth/login`,
      body: {
        email: Cypress.env('adminEmail'),
        senha: Cypress.env('adminPassword'),
      },
    })
    .its('body.token');
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
  /* eslint-disable-next-line @typescript-eslint/no-namespace */
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
