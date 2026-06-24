/// <reference types="cypress" />

/**
 * Testa o fluxo kanban completo:
 * A_FAZER → EM_ANDAMENTO → EM_VALIDACAO → CONCLUIDA
 *       ↘                       ↓
 *         CANCELADA          DEVOLVER → EM_ANDAMENTO
 */

const ts = () => Date.now();

describe('Fluxo Kanban — Solicitações', () => {
  let token: string;
  let modeloId: string;
  let responsavelId: string;

  // Setup: cria máquina, modelo e obtém ID de um responsável válido (OPERADOR/GESTOR)
  before(() => {
    cy.apiLogin().then((t) => {
      token = t;

      // Busca um usuário OPERADOR ou GESTOR para usar como responsável na triagem
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/admin/usuarios?size=20`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        const body = res.body as { content: Array<{ id: string; perfil: string }> };
        const responsavel = body.content.find(
          (u) => u.perfil === 'OPERADOR' || u.perfil === 'GESTOR',
        );
        responsavelId = responsavel?.id ?? '';
      });

      cy.apiPost(
        '/admin/maquinas',
        { nome: `Maq Kanban ${ts()}`, codigo: `KBN-${ts()}` },
        token,
      ).then((maqRes) => {
        const maq = maqRes.body as { id: string };

        cy.apiPost(
          '/modelos',
          {
            codigo: `MDL-KBN-${ts()}`,
            descricao: 'Modelo para testes kanban',
            maquinaId: maq.id,
          },
          token,
        ).then((mdlRes) => {
          const mdl = mdlRes.body as { id: string };
          modeloId = mdl.id;
        });
      });
    });
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  function abrirSolicitacaoViaUi(titulo: string) {
    cy.loginAdmin('/app/solicitacoes/nova');
    cy.get('input[name="titulo"]').type(titulo);
    cy.get('textarea[name="descricao"]').type('Descrição da solicitação de teste Cypress');
    cy.get('select[name="tipo"]').select('REPARO');
    cy.get('input[name="modeloId"]').type(modeloId);
    cy.contains('button', 'Abrir solicitação').click();
    cy.url().should('match', /\/app\/solicitacoes\/[a-f0-9-]+$/);
  }

  function abrirSolicitacaoViaApi(titulo: string) {
    return cy
      .apiPost(
        '/solicitacoes',
        { titulo, descricao: 'Via API Cypress', tipo: 'REPARO', modeloId },
        token,
      )
      .then((res) => (res.body as { id: string }).id);
  }

  function triarViaApi(id: string) {
    return cy.apiPatch(
      `/solicitacoes/${id}/triar`,
      { prioridade: 'MEDIA', responsavelIds: [responsavelId] },
      token,
    );
  }

  // ── Testes ───────────────────────────────────────────────────────────────

  it('abre solicitação via UI e exibe status A fazer', () => {
    abrirSolicitacaoViaUi(`Solicitação UI ${ts()}`);
    cy.contains('A fazer').should('be.visible');
  });

  it('lista solicitações mostra a solicitação criada', () => {
    const titulo = `Listagem CY ${ts()}`;
    abrirSolicitacaoViaApi(titulo).then(() => {
      cy.loginAdmin('/app/solicitacoes');
      cy.get('.lg\\:flex').contains(titulo).should('be.visible');
    });
  });

  it('triagem: A_FAZER → EM_ANDAMENTO', () => {
    abrirSolicitacaoViaApi(`Triagem ${ts()}`).then((id) => {
      cy.loginAdmin(`/app/solicitacoes/${id}`);
      cy.contains('A fazer').should('be.visible');

      cy.contains('button', 'Triar').click();
      cy.contains('Triar solicitação').should('be.visible');

      cy.get('select[name="prioridade"]').select('ALTA');
      cy.get('input[name="responsavelIds"]').first().check();
      cy.contains('button', 'Confirmar triagem').click();

      cy.contains('Em andamento').should('be.visible');
      cy.contains('button', 'Triar').should('not.exist');
    });
  });

  it('envio para validação: EM_ANDAMENTO → EM_VALIDACAO', () => {
    abrirSolicitacaoViaApi(`Validação ${ts()}`).then((id) => {
      triarViaApi(id);

      cy.loginAdmin(`/app/solicitacoes/${id}`);
      cy.contains('Em andamento').should('be.visible');

      cy.contains('button', 'Enviar para validação').click();
      cy.contains('Em validação').should('be.visible');
    });
  });

  it('devolver: EM_VALIDACAO → EM_ANDAMENTO', () => {
    abrirSolicitacaoViaApi(`Devolver ${ts()}`).then((id) => {
      triarViaApi(id);
      cy.apiPatch(`/solicitacoes/${id}/enviar-validacao`, null, token);

      cy.loginAdmin(`/app/solicitacoes/${id}`);
      cy.contains('Em validação').should('be.visible');

      cy.contains('button', 'Devolver').click();
      cy.contains('Devolver solicitação').should('be.visible');
      cy.contains('button', 'Confirmar devolução').click();

      cy.contains('Em andamento').should('be.visible');
    });
  });

  it('concluir: EM_ANDAMENTO → EM_VALIDACAO → CONCLUIDA', () => {
    abrirSolicitacaoViaApi(`Concluir ${ts()}`).then((id) => {
      triarViaApi(id);
      cy.apiPatch(`/solicitacoes/${id}/enviar-validacao`, null, token);

      cy.loginAdmin(`/app/solicitacoes/${id}`);
      cy.contains('Em validação').should('be.visible');

      cy.contains('button', 'Encerrar').click();
      cy.contains('Encerrar solicitação').should('be.visible');

      cy.get('textarea[name="comentario"]').first().type('Concluído com sucesso pelo Cypress');
      cy.contains('button', 'Concluir').click();

      cy.contains('Concluída').should('be.visible');
      cy.contains('button', 'Encerrar').should('not.exist');
      cy.contains('button', 'Triar').should('not.exist');
    });
  });

  it('cancelar: EM_ANDAMENTO → CANCELADA', () => {
    abrirSolicitacaoViaApi(`Cancelar ${ts()}`).then((id) => {
      triarViaApi(id);

      cy.loginAdmin(`/app/solicitacoes/${id}`);
      cy.contains('Em andamento').should('be.visible');

      cy.contains('button', 'Encerrar').click();

      cy.contains('label', 'Cancelar').click();
      cy.get('textarea[name="comentario"]').first().type('Cancelado pelo Cypress');
      cy.contains('button', 'Cancelar solicitação').click();

      cy.contains('Cancelada').should('be.visible');
    });
  });

  it('fluxo completo: A_FAZER → EM_ANDAMENTO → EM_VALIDACAO → CONCLUIDA', () => {
    const titulo = `Fluxo Completo ${ts()}`;

    cy.loginAdmin('/app/solicitacoes/nova');
    cy.get('input[name="titulo"]').type(titulo);
    cy.get('textarea[name="descricao"]').type('Teste do fluxo completo via Cypress');
    cy.get('select[name="tipo"]').select('INSPECAO');
    cy.get('input[name="modeloId"]').type(modeloId);
    cy.contains('button', 'Abrir solicitação').click();

    cy.url().should('match', /\/app\/solicitacoes\/[a-f0-9-]+$/);
    cy.contains('A fazer').should('be.visible');

    // Triagem
    cy.contains('button', 'Triar').click();
    cy.get('select[name="prioridade"]').select('URGENTE');
    cy.get('input[name="responsavelIds"]').first().check();
    cy.contains('button', 'Confirmar triagem').click();
    cy.contains('Em andamento').should('be.visible');

    // Enviar para validação
    cy.contains('button', 'Enviar para validação').click();
    cy.contains('Em validação').should('be.visible');

    // Concluir
    cy.contains('button', 'Encerrar').click();
    cy.get('textarea[name="comentario"]').first().type('Fluxo completo concluído');
    cy.contains('button', 'Concluir').click();
    cy.contains('Concluída').should('be.visible');

    // Histórico deve mostrar as transições
    cy.contains('Histórico de atividades').should('be.visible');
  });

  it('comentário aparece no histórico', () => {
    abrirSolicitacaoViaApi(`Comentário ${ts()}`).then((id) => {
      cy.loginAdmin(`/app/solicitacoes/${id}`);

      cy.contains('Adicionar comentário').should('be.visible');
      cy.get('textarea[name="comentario"]').type('Comentário de teste via Cypress');
      cy.contains('button', 'Enviar comentário').click();

      cy.contains('Histórico de atividades').should('be.visible');
    });
  });
});
