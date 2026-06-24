/// <reference types="cypress" />

const ts = () => Date.now();

describe('Admin — Máquinas', () => {
  beforeEach(() => {
    cy.loginAdmin('/app/admin/maquinas');
  });

  it('exibe lista de máquinas', () => {
    cy.contains('Máquinas').should('be.visible');
  });

  it('cria uma nova máquina', () => {
    const codigo = `MQ-CY-${ts()}`;
    cy.contains('a', 'Nova máquina').click();
    cy.url().should('include', '/maquinas/novo');

    cy.get('input[name="codigo"]').type(codigo);
    cy.get('input[name="nome"]').type(`Máquina Cypress ${codigo}`);
    cy.get('textarea[name="descricao"]').type('Criada pelo Cypress');

    cy.contains('button', 'Salvar máquina').click();
    cy.url().should('include', '/app/admin/maquinas');
    cy.contains(codigo).should('be.visible');
  });

  it('exibe erro ao criar máquina com código duplicado', () => {
    cy.apiLogin().then((token) => {
      const codigo = `MQ-DUP-${ts()}`;
      cy.apiPost('/admin/maquinas', { nome: 'Original', codigo }, token);

      cy.loginAdmin('/app/admin/maquinas/novo');
      cy.get('input[name="codigo"]').type(codigo);
      cy.get('input[name="nome"]').type('Duplicada');
      cy.contains('button', 'Salvar máquina').click();

      cy.contains('Não foi possível').should('be.visible');
    });
  });
});

describe('Admin — Modelos', () => {
  let token: string;
  let maquinaId: string;

  before(() => {
    cy.apiLogin().then((t) => {
      token = t;
      cy.apiPost('/admin/maquinas', { nome: `Maq Modelo ${ts()}`, codigo: `MQ-MDL-${ts()}` }, token).then((res) => {
        const body = res.body as { id: string };
        maquinaId = body.id;
      });
    });
  });

  beforeEach(() => {
    cy.loginAdmin('/app/admin/modelos/novo');
  });

  it('cria um novo modelo vinculado a uma máquina', () => {
    const codigo = `MDL-CY-${ts()}`;
    cy.get('input[name="codigo"]').type(codigo);
    cy.get('textarea[name="descricao"]').type('Modelo criado pelo Cypress');
    // Aguarda as opções de máquina carregarem
    cy.get('select[name="maquinaId"] option').should('have.length.greaterThan', 1);
    cy.get('select[name="maquinaId"]').select(maquinaId);

    cy.contains('button', 'Salvar modelo').click();
    cy.url().should('match', /\/app\/admin\/modelos\/[a-f0-9-]+$/);
    cy.contains(codigo).should('be.visible');
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
    cy.contains(email).should('be.visible');
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
