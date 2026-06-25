/// <reference types="cypress" />

describe('Dashboard Page', () => {
  beforeEach(() => {
    cy.loginAdmin('/app/dashboard');
  });

  it('exibe o título e descrição do dashboard', () => {
    cy.contains('h1', 'Dashboard').should('be.visible');
    cy.contains('solicitações no total').should('be.visible');
  });

  it('exibe os cartões de KPI principais', () => {
    cy.contains('Total').should('be.visible');
    cy.contains('Concluídas').should('be.visible');
    cy.contains('Lead time médio').should('be.visible');
    cy.contains('Em atraso').should('be.visible');
  });

  it('exibe os gráficos/listas de distribuição', () => {
    cy.contains('Distribuição por status').should('be.visible');
    cy.contains('Distribuição por tipo').should('be.visible');
    cy.contains('Distribuição por prioridade').should('be.visible');
    cy.contains('Modelos de máquinas').should('be.visible');
  });
});
