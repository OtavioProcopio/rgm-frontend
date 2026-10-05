import { describe, expect, it } from 'vitest';

import type { StatusSolicitacao } from '../types/solicitacaoTypes';
import {
  acaoDoMovimento,
  acoesPermitidas,
  botoesDeAcao,
  proximoStatus,
  type AcaoSolicitacao,
  type AtorSolicitacao,
} from './acoesSolicitacao';

const gestor: AtorSolicitacao = { id: 'ge', perfil: 'GESTOR' };
const administrador: AtorSolicitacao = { id: 'ad', perfil: 'ADMINISTRADOR' };
const operador: AtorSolicitacao = { id: 'op', perfil: 'OPERADOR' };
const externo: AtorSolicitacao = { id: 'ex', perfil: 'EXTERNO' };

function solicitacao(
  status: StatusSolicitacao,
  extra: { abertaPorUsuarioId?: string; responsavelIds?: string[]; acoesPermitidas?: string[] | null } = {},
) {
  return { status, abertaPorUsuarioId: 'outro', responsavelIds: [], ...extra };
}

function ordenadas(acoes: ReadonlySet<AcaoSolicitacao>) {
  return [...acoes].sort();
}

describe('acoesPermitidas', () => {
  it('deve devolver só as ações informadas quando a API informa as ações', () => {
    // Arrange
    const informada = solicitacao('A_FAZER', { acoesPermitidas: ['DEVOLVER', 'ENCERRAR'] });

    // Act
    const acoes = acoesPermitidas(informada, gestor);

    // Assert
    expect(ordenadas(acoes)).toEqual(['DEVOLVER', 'ENCERRAR']);
  });

  it('deve ignorar ação que esta tela não trata quando a API informa as ações', () => {
    // Arrange
    const informada = solicitacao('EM_ANDAMENTO', { acoesPermitidas: ['COMENTAR', 'EDITAR', 'CANCELAR'] });

    // Act
    const acoes = acoesPermitidas(informada, operador);

    // Assert
    expect(ordenadas(acoes)).toEqual(['CANCELAR']);
  });

  it('deve não permitir nada quando a API informa uma lista vazia', () => {
    // Arrange
    const informada = solicitacao('A_FAZER', { acoesPermitidas: [] });

    // Act
    const acoes = acoesPermitidas(informada, administrador);

    // Assert
    expect(acoes.size).toBe(0);
  });

  it.each([
    ['A_FAZER', ['CANCELAR', 'TRIAR']],
    ['EM_ANDAMENTO', ['ALTERAR_RESPONSAVEIS', 'CANCELAR', 'ENVIAR_VALIDACAO']],
    ['EM_VALIDACAO', ['ALTERAR_RESPONSAVEIS', 'CANCELAR', 'DEVOLVER', 'ENCERRAR']],
    ['CONCLUIDA', []],
    ['CANCELADA', []],
  ] as const)(
    'deve aplicar a regra local de gestor quando a API não informa as ações e o status é %s',
    (status, esperadas) => {
      // Arrange
      const naoInformada = solicitacao(status, { acoesPermitidas: null });

      // Act
      const doGestor = acoesPermitidas(naoInformada, gestor);
      const doAdministrador = acoesPermitidas(naoInformada, administrador);

      // Assert
      expect(ordenadas(doGestor)).toEqual(esperadas);
      expect(ordenadas(doAdministrador)).toEqual(esperadas);
    },
  );

  it('deve permitir enviar para validação quando o operador é responsável e o status é EM_ANDAMENTO', () => {
    // Arrange
    const atribuida = solicitacao('EM_ANDAMENTO', { responsavelIds: ['op'] });

    // Act
    const acoes = acoesPermitidas(atribuida, operador);

    // Assert
    expect(ordenadas(acoes)).toEqual(['ENVIAR_VALIDACAO']);
  });

  it('deve não permitir nada quando o operador não é responsável', () => {
    // Arrange
    const deOutro = solicitacao('EM_ANDAMENTO', { responsavelIds: ['outro-operador'] });

    // Act
    const acoes = acoesPermitidas(deOutro, operador);

    // Assert
    expect(acoes.size).toBe(0);
  });

  it('deve permitir cancelar quando o operador abriu a solicitação e ela está em A_FAZER sem responsável', () => {
    // Arrange
    const propria = solicitacao('A_FAZER', { abertaPorUsuarioId: 'op' });

    // Act
    const acoes = acoesPermitidas(propria, operador);

    // Assert
    expect(ordenadas(acoes)).toEqual(['CANCELAR']);
  });

  it('deve não permitir cancelar quando a solicitação do operador já tem responsável', () => {
    // Arrange
    const triada = solicitacao('A_FAZER', { abertaPorUsuarioId: 'op', responsavelIds: ['ge'] });

    // Act
    const acoes = acoesPermitidas(triada, operador);

    // Assert
    expect(acoes.size).toBe(0);
  });

  it('deve não permitir nada quando o operador ainda não tem id carregado', () => {
    // Arrange
    const semDono = solicitacao('A_FAZER', { abertaPorUsuarioId: '' });

    // Act
    const acoes = acoesPermitidas(semDono, { id: undefined, perfil: 'OPERADOR' });

    // Assert
    expect(acoes.size).toBe(0);
  });

  it('deve não permitir nada quando o perfil é externo ou está ausente', () => {
    // Arrange
    const aberta = solicitacao('EM_ANDAMENTO', { abertaPorUsuarioId: 'ex', responsavelIds: ['ex'] });

    // Act
    const doExterno = acoesPermitidas(aberta, externo);
    const semPerfil = acoesPermitidas(aberta, {});

    // Assert
    expect(doExterno.size).toBe(0);
    expect(semPerfil.size).toBe(0);
  });
});

describe('acaoDoMovimento', () => {
  it.each([
    ['A_FAZER', 'EM_ANDAMENTO', 'TRIAR'],
    ['EM_ANDAMENTO', 'EM_VALIDACAO', 'ENVIAR_VALIDACAO'],
    ['EM_VALIDACAO', 'CONCLUIDA', 'ENCERRAR'],
    ['EM_VALIDACAO', 'EM_ANDAMENTO', 'DEVOLVER'],
    ['A_FAZER', 'CANCELADA', 'CANCELAR'],
    ['EM_ANDAMENTO', 'CANCELADA', 'CANCELAR'],
    ['EM_VALIDACAO', 'CANCELADA', 'CANCELAR'],
  ] as const)('deve devolver a ação quando o card vai de %s para %s', (de, para, esperada) => {
    // Act
    const acao = acaoDoMovimento(de, para);

    // Assert
    expect(acao).toBe(esperada);
  });

  it.each([
    ['A_FAZER', 'A_FAZER'],
    ['A_FAZER', 'EM_VALIDACAO'],
    ['A_FAZER', 'CONCLUIDA'],
    ['EM_ANDAMENTO', 'A_FAZER'],
    ['EM_ANDAMENTO', 'CONCLUIDA'],
    ['CONCLUIDA', 'EM_ANDAMENTO'],
    ['CANCELADA', 'A_FAZER'],
  ] as const)('deve devolver nulo quando o movimento de %s para %s não existe', (de, para) => {
    // Act
    const acao = acaoDoMovimento(de, para);

    // Assert
    expect(acao).toBeNull();
  });
});

describe('proximoStatus', () => {
  it.each([
    ['A_FAZER', 'EM_ANDAMENTO'],
    ['EM_ANDAMENTO', 'EM_VALIDACAO'],
    ['EM_VALIDACAO', 'CONCLUIDA'],
    ['CONCLUIDA', null],
    ['CANCELADA', null],
  ] as const)('deve devolver a coluna seguinte quando o status é %s', (status, esperado) => {
    // Act
    const proximo = proximoStatus(status);

    // Assert
    expect(proximo).toBe(esperado);
  });
});

describe('botoesDeAcao', () => {
  it('deve oferecer Encerrar sem Cancelar quando as duas ações são permitidas', () => {
    // Arrange
    const acoes = new Set<AcaoSolicitacao>(['CANCELAR', 'ENCERRAR', 'DEVOLVER', 'ALTERAR_RESPONSAVEIS']);

    // Act
    const rotulos = botoesDeAcao(acoes).map((botao) => botao.rotulo);

    // Assert
    expect(rotulos).toEqual(['Alterar responsáveis', 'Devolver', 'Encerrar']);
  });

  it('deve oferecer Cancelar quando Encerrar não é permitida', () => {
    // Arrange
    const acoes = new Set<AcaoSolicitacao>(['CANCELAR', 'TRIAR']);

    // Act
    const rotulos = botoesDeAcao(acoes).map((botao) => botao.rotulo);

    // Assert
    expect(rotulos).toEqual(['Triar', 'Cancelar']);
  });

  it('deve não oferecer botão quando nenhuma ação é permitida', () => {
    // Act
    const botoes = botoesDeAcao(new Set());

    // Assert
    expect(botoes).toEqual([]);
  });
});
