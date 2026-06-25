/// <reference types="cypress" />

const ts = () => Date.now();

describe('Admin — Modelos', () => {
  beforeEach(() => {
    cy.loginAdmin('/app/admin/modelos/novo');
  });

  it('cria um novo modelo com máquina text input', () => {
    const codigo = `MDL-CY-${ts()}`;
    cy.get('input[name="codigo"]').type(codigo);
    cy.get('input[name="descricao"]').type('Modelo criado pelo Cypress');
    cy.get('input[name="maquina"]').type('Vick');

    cy.contains('button', 'Salvar modelo').click();
    cy.url().should('include', '/app/admin/modelos');
    cy.contains('td', codigo).should('be.visible');
  });
});

describe('Admin — Usuários', () => {
  beforeEach(() => {
    cy.loginAdmin('/app/admin/usuarios');
  });

  it('exibe lista de usuários', () => {
    cy.contains('Usuários').should('be.visible');
  });

  it('cria um usuário Gestor', () => {
    const email = `gestor.cy.${ts()}@rgm.com`;
    cy.contains('a', 'Novo usuário').click();
    cy.url().should('include', '/usuarios/novo');

    cy.get('input[name="nome"]').type(`Gestor Cypress ${ts()}`);
    cy.get('select[name="perfil"]').select('GESTOR');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="senha"]').type('senha123');

    cy.contains('button', 'Salvar usuário').click();
    cy.url().should('include', '/app/admin/usuarios');
    cy.contains('td', email).should('be.visible');
  });

  it('cria um prestador Externo (sem email/senha)', () => {
    cy.contains('a', 'Novo usuário').click();
    cy.get('input[name="nome"]').type(`Prestador CY ${ts()}`);
    cy.get('select[name="perfil"]').select('EXTERNO');

    cy.contains('Prestador externo não acessa o sistema').should('be.visible');
    cy.contains('button', 'Salvar usuário').click();
    cy.url().should('include', '/app/admin/usuarios');
  });
});
