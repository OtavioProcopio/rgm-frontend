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

  it('clica no perfil e visualiza os dados do usuário', () => {
    cy.loginAdmin('/app/admin');
    
    // Clica no card de perfil no final do menu lateral
    cy.contains('Meu Perfil').click();
    
    cy.url().should('include', '/app/perfil');
    cy.contains('Meu Perfil').should('be.visible');
    cy.contains('ADMINISTRADOR').should('be.visible');
    cy.contains('admin@rgm.com').should('be.visible');
  });

  it('altera a própria senha e valida o comportamento', () => {
    cy.loginAdmin('/app/perfil');

    // Tenta submeter sem preencher
    cy.contains('button', 'Atualizar Senha').click();
    cy.contains('Senha atual é obrigatória').should('be.visible');

    // Digita senha incorreta
    cy.get('input[name="senhaAtual"]').type('senha_errada');
    cy.get('input[name="novaSenha"]').type('novasenha123');
    cy.get('input[name="confirmarNovaSenha"]').type('novasenha123');
    cy.contains('button', 'Atualizar Senha').click();
    cy.contains('Senha atual incorreta.').should('be.visible');

    // Valida senhas não coincidentes
    cy.get('input[name="senhaAtual"]').clear().type(Cypress.env('adminPassword'));
    cy.get('input[name="novaSenha"]').clear().type('novasenha123');
    cy.get('input[name="confirmarNovaSenha"]').clear().type('senha_diferente');
    cy.contains('button', 'Atualizar Senha').click();
    cy.contains('As senhas não coincidem').should('be.visible');

    // Altera com sucesso
    cy.get('input[name="senhaAtual"]').clear().type(Cypress.env('adminPassword'));
    cy.get('input[name="novaSenha"]').clear().type('novasenha123');
    cy.get('input[name="confirmarNovaSenha"]').clear().type('novasenha123');
    cy.contains('button', 'Atualizar Senha').click();
    cy.contains('Senha alterada com sucesso!').should('be.visible');

    // Restaura a senha padrão para não quebrar outros testes E2E
    cy.get('input[name="senhaAtual"]').clear().type('novasenha123');
    cy.get('input[name="novaSenha"]').clear().type(Cypress.env('adminPassword'));
    cy.get('input[name="confirmarNovaSenha"]').clear().type(Cypress.env('adminPassword'));
    cy.contains('button', 'Atualizar Senha').click();
    cy.contains('Senha alterada com sucesso!').should('be.visible');
  });
});
