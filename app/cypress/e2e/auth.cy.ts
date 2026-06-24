/// <reference types="cypress" />

describe('Autenticação', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
  });

  it('redireciona para /login quando não autenticado', () => {
    cy.visit('/app/solicitacoes');
    cy.url().should('include', '/login');
  });

  it('faz login com credenciais válidas e redireciona para o app', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('adminEmail'));
    cy.get('input[name="senha"]').type(Cypress.env('adminPassword'));
    cy.contains('button', 'Entrar').click();
    cy.url().should('include', '/app/');
  });

  it('exibe erro com credenciais inválidas', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('wrong@email.com');
    cy.get('input[name="senha"]').type('wrongpassword');
    cy.contains('button', 'Entrar').click();
    cy.contains('E-mail ou senha inválidos').should('be.visible');
  });

  it('faz logout e redireciona para /login', () => {
    cy.loginAdmin('/app/admin');
    cy.contains('button', 'Sair').click();
    cy.url().should('include', '/login');
  });

  it('admin vai para /app/admin após login', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('adminEmail'));
    cy.get('input[name="senha"]').type(Cypress.env('adminPassword'));
    cy.contains('button', 'Entrar').click();
    cy.url().should('include', '/app/admin');
  });
});
