import { describe, expect, it } from 'vitest';

import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import {
  relacaoDoOperador,
  ROTULO_DA_RELACAO,
} from '@/features/solicitacoes/lib/relacaoDoOperador';

const OPERADOR = 'op-1';
const OUTRO = 'op-2';

describe('relacaoDoOperador', () => {
  it('deve ser atribuída quando o operador é responsável e não abriu a solicitação', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ abertaPorUsuarioId: OUTRO, responsavelIds: [OPERADOR] });

    // Act
    const relacao = relacaoDoOperador(solicitacao, OPERADOR);

    // Assert
    expect(relacao).toBe('ATRIBUIDA');
  });

  it('deve ser atribuída quando o operador abriu a solicitação e também é responsável', () => {
    // Arrange
    const solicitacao = criarSolicitacao({
      abertaPorUsuarioId: OPERADOR,
      responsavelIds: [OUTRO, OPERADOR],
    });

    // Act
    const relacao = relacaoDoOperador(solicitacao, OPERADOR);

    // Assert
    expect(relacao).toBe('ATRIBUIDA');
  });

  it('deve ser aberta quando o operador abriu a solicitação e não é responsável', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ abertaPorUsuarioId: OPERADOR, responsavelIds: [OUTRO] });

    // Act
    const relacao = relacaoDoOperador(solicitacao, OPERADOR);

    // Assert
    expect(relacao).toBe('ABERTA');
  });

  it('deve ser nula quando o operador não abriu nem é responsável', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ abertaPorUsuarioId: OUTRO, responsavelIds: [OUTRO] });

    // Act
    const relacao = relacaoDoOperador(solicitacao, OPERADOR);

    // Assert
    expect(relacao).toBeNull();
  });

  it('deve ser nula quando o id do operador ainda não é conhecido', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ abertaPorUsuarioId: OPERADOR, responsavelIds: [OPERADOR] });

    // Act
    const relacao = relacaoDoOperador(solicitacao, undefined);

    // Assert
    expect(relacao).toBeNull();
  });
});

describe('ROTULO_DA_RELACAO', () => {
  it.each([
    ['ABERTA', 'Aberta por você'],
    ['ATRIBUIDA', 'Atribuída a você'],
  ] as const)('deve rotular a relação %s como "%s"', (relacao, esperado) => {
    // Act
    const rotulo = ROTULO_DA_RELACAO[relacao];

    // Assert
    expect(rotulo).toBe(esperado);
  });
});
