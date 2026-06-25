/// <reference types="cypress" />

const ts = () => Date.now();

describe('Evidências', () => {
  let token: string;
  let modeloId: string;

  before(() => {
    cy.apiLogin().then((t) => {
      token = t;

      cy.apiPost(
        '/admin/maquinas',
        { nome: `Maq Evidencia ${ts()}`, codigo: `EV-${ts()}` },
        token,
      ).then((maqRes) => {
        const maq = maqRes.body as { id: string };
        cy.apiPost(
          '/modelos',
          { codigo: `MDL-EV-${ts()}`, descricao: 'Modelo evidencia', maquinaId: maq.id },
          token,
        ).then((mdlRes) => {
          modeloId = (mdlRes.body as { id: string }).id;
        });
      });
    });
  });

  it('faz upload de imagem e exibe na lista de evidências', () => {
    cy.apiPost(
      '/solicitacoes',
      { titulo: `Evidencia ${ts()}`, descricao: 'Teste upload', tipo: 'REPARO', modeloId },
      token,
    ).then((res) => {
      const id = (res.body as { id: string }).id;
      cy.loginAdmin(`/app/solicitacoes/${id}`);

      cy.contains('Evidências').should('be.visible');

      // Cria um arquivo PNG sintético via cy.fixture
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64',
          ),
          fileName: 'evidencia-cypress.png',
          mimeType: 'image/png',
        },
        { force: true },
      );

      // Aguarda o upload e a exibição de ao menos um card de evidência
      cy.get('[data-cy="evidencia-card"], img[alt]', { timeout: 15000 }).should('exist');
    });
  });

  it('rejeita arquivo com tipo inválido', () => {
    cy.apiPost(
      '/solicitacoes',
      { titulo: `Evidencia Inv ${ts()}`, descricao: 'Tipo inválido', tipo: 'REPARO', modeloId },
      token,
    ).then((res) => {
      const id = (res.body as { id: string }).id;
      cy.loginAdmin(`/app/solicitacoes/${id}`);

      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('conteudo texto'),
          fileName: 'arquivo.txt',
          mimeType: 'text/plain',
        },
        { force: true },
      );

      cy.contains('Tipo de arquivo não permitido').should('be.visible');
    });
  });
});
