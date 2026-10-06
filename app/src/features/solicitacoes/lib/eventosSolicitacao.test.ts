import { describe, expect, it } from 'vitest';

import { criarSolicitacao } from '@/test-utils/solicitacaoFixture';

import { lerEventoAtividade, lerEventoSolicitacao, mesclarSolicitacaoDoEvento } from './eventosSolicitacao';

describe('lerEventoSolicitacao', () => {
  it('deve devolver o tipo e a solicitação quando o corpo é um evento de solicitação', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'EM_ANDAMENTO' });
    const data = JSON.stringify({ tipo: 'triada', solicitacao });

    // Act
    const evento = lerEventoSolicitacao(data);

    // Assert
    expect(evento).toEqual({ tipo: 'triada', solicitacao });
  });

  it('deve devolver tipo vazio quando o evento não informa o tipo', () => {
    // Arrange
    const data = JSON.stringify({ solicitacao: criarSolicitacao() });

    // Act
    const evento = lerEventoSolicitacao(data);

    // Assert
    expect(evento?.tipo).toBe('');
  });

  it.each([
    ['não é texto', undefined],
    ['não é JSON', 'ok'],
    ['é um JSON que não é objeto', '42'],
    ['é nulo', 'null'],
    ['não tem solicitação', JSON.stringify({ tipo: 'triada' })],
    ['tem solicitação sem id', JSON.stringify({ tipo: 'triada', solicitacao: { status: 'A_FAZER' } })],
    ['tem solicitação sem status', JSON.stringify({ tipo: 'triada', solicitacao: { id: 's1' } })],
  ])('deve devolver nulo quando o corpo %s', (_, data) => {
    // Act
    const evento = lerEventoSolicitacao(data);

    // Assert
    expect(evento).toBeNull();
  });
});

describe('lerEventoAtividade', () => {
  it('deve devolver o tipo e o id da solicitação quando o corpo é um aviso de atividade', () => {
    // Arrange
    const data = JSON.stringify({ tipo: 'comentada', solicitacaoId: 's1' });

    // Act
    const evento = lerEventoAtividade(data);

    // Assert
    expect(evento).toEqual({ tipo: 'comentada', solicitacaoId: 's1' });
  });

  it('deve devolver tipo vazio quando o aviso não informa o tipo', () => {
    // Act
    const evento = lerEventoAtividade(JSON.stringify({ solicitacaoId: 's1' }));

    // Assert
    expect(evento).toEqual({ tipo: '', solicitacaoId: 's1' });
  });

  it.each([
    ['não é JSON', '{'],
    ['não tem o id da solicitação', JSON.stringify({ tipo: 'comentada' })],
  ])('deve devolver nulo quando o corpo %s', (_, data) => {
    // Act
    const evento = lerEventoAtividade(data);

    // Assert
    expect(evento).toBeNull();
  });
});

describe('mesclarSolicitacaoDoEvento', () => {
  const atual = criarSolicitacao({
    status: 'EM_VALIDACAO',
    responsavelIds: ['op'],
    acoesPermitidas: ['DEVOLVER', 'ENCERRAR'],
  });

  it('deve trocar o status, manter os responsáveis e descartar as ações informadas quando o evento é de mudança de status', () => {
    // Arrange
    const devolvida = criarSolicitacao({ status: 'EM_ANDAMENTO', prioridade: 'ALTA', responsavelIds: [] });

    // Act
    const mesclada = mesclarSolicitacaoDoEvento(atual, { tipo: 'devolvida', solicitacao: devolvida });

    // Assert
    expect(mesclada.status).toBe('EM_ANDAMENTO');
    expect(mesclada.prioridade).toBe('ALTA');
    expect(mesclada.responsavelIds).toEqual(['op']);
    expect(mesclada.acoesPermitidas).toBeNull();
  });

  it('deve trocar os responsáveis quando o evento é de troca de responsáveis', () => {
    // Arrange
    const comOutros = criarSolicitacao({ status: 'EM_VALIDACAO', responsavelIds: ['ge', 'op2'] });

    // Act
    const mesclada = mesclarSolicitacaoDoEvento(atual, { tipo: 'responsaveis_alterados', solicitacao: comOutros });

    // Assert
    expect(mesclada.responsavelIds).toEqual(['ge', 'op2']);
  });

  it('deve ficar sem responsáveis quando a troca de responsáveis vem sem a lista', () => {
    // Arrange
    const semLista = { ...criarSolicitacao(), responsavelIds: undefined } as unknown as typeof atual;

    // Act
    const mesclada = mesclarSolicitacaoDoEvento(atual, { tipo: 'responsaveis_alterados', solicitacao: semLista });

    // Assert
    expect(mesclada.responsavelIds).toEqual([]);
  });
});
