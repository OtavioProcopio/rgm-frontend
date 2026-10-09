import { describe, expect, it } from 'vitest';

import {
  historicoDaSolicitacao,
  iniciaisDe,
} from '@/features/solicitacoes/lib/historicoDaSolicitacao';
import type {
  AtividadeSolicitacao,
  TipoAtividadeSolicitacao,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import { rotuloDoTipoDeAtividade } from '@/shared/lib/rotulos';

function atividade(parcial: Partial<AtividadeSolicitacao> = {}): AtividadeSolicitacao {
  return {
    id: 'a1',
    solicitacaoId: 's1',
    tipo: 'COMENTARIO',
    deStatus: null,
    paraStatus: null,
    comentario: null,
    autorUsuarioId: 'u1',
    autorNome: 'Ana Souza',
    criadaEm: '2026-01-01T10:00:00Z',
    ...parcial,
  };
}

describe('historicoDaSolicitacao', () => {
  it.each<TipoAtividadeSolicitacao>([
    'ABERTURA',
    'ATRIBUICAO',
    'MUDANCA_STATUS',
    'COMENTARIO',
    'EVIDENCIA_ADICIONADA',
  ])('deve usar o rótulo do dicionário como título quando o tipo é %s', (tipo) => {
    // Arrange
    const entrada = [atividade({ tipo })];

    // Act
    const [item] = historicoDaSolicitacao(entrada);

    // Assert
    expect(item.titulo).toBe(rotuloDoTipoDeAtividade[tipo]);
    expect(item.tipo).toBe(tipo);
    expect(item.id).toBe('a1');
    expect(item.em).toBe('2026-01-01T10:00:00Z');
  });

  it.each<[TipoAtividadeSolicitacao, string]>([
    ['COMENTARIO', 'destaque'],
    ['EVIDENCIA_ADICIONADA', 'destaque'],
    ['ABERTURA', 'destaque'],
    ['ATRIBUICAO', 'discreto'],
    ['MUDANCA_STATUS', 'discreto'],
  ])('deve atribuir o peso correto quando o tipo é %s', (tipo, peso) => {
    // Arrange
    const entrada = [atividade({ tipo })];

    // Act
    const [item] = historicoDaSolicitacao(entrada);

    // Assert
    expect(item.peso).toBe(peso);
  });

  it('deve informar de e para quando a mudança de status tem os dois status', () => {
    // Arrange
    const entrada = [
      atividade({ tipo: 'MUDANCA_STATUS', deStatus: 'A_FAZER', paraStatus: 'EM_ANDAMENTO' }),
    ];

    // Act
    const [item] = historicoDaSolicitacao(entrada);

    // Assert
    expect(item.mudancaDeStatus).toEqual({ de: 'A_FAZER', para: 'EM_ANDAMENTO' });
  });

  it('deve deixar mudancaDeStatus nulo quando a mudança de status não tem deStatus', () => {
    // Arrange
    const entrada = [
      atividade({ tipo: 'MUDANCA_STATUS', deStatus: null, paraStatus: 'EM_ANDAMENTO' }),
    ];

    // Act
    const [item] = historicoDaSolicitacao(entrada);

    // Assert
    expect(item.mudancaDeStatus).toBeNull();
  });

  it('deve deixar mudancaDeStatus nulo quando o tipo não é mudança de status', () => {
    // Arrange
    const entrada = [
      atividade({ tipo: 'COMENTARIO', deStatus: 'A_FAZER', paraStatus: 'EM_ANDAMENTO' }),
    ];

    // Act
    const [item] = historicoDaSolicitacao(entrada);

    // Assert
    expect(item.mudancaDeStatus).toBeNull();
  });

  it('deve levar o texto em detalhe quando a atividade tem comentário', () => {
    // Arrange
    const entrada = [atividade({ comentario: 'Peça revisada' })];

    // Act
    const [item] = historicoDaSolicitacao(entrada);

    // Assert
    expect(item.detalhe).toBe('Peça revisada');
  });

  it('deve deixar detalhe nulo quando a atividade não tem comentário', () => {
    // Arrange
    const entrada = [atividade({ comentario: null })];

    // Act
    const [item] = historicoDaSolicitacao(entrada);

    // Assert
    expect(item.detalhe).toBeNull();
  });

  it('deve montar o autor com nome e iniciais quando a atividade tem autor', () => {
    // Arrange
    const entrada = [atividade({ autorNome: 'Ana Souza' })];

    // Act
    const [item] = historicoDaSolicitacao(entrada);

    // Assert
    expect(item.autor).toEqual({ nome: 'Ana Souza', iniciais: 'AS' });
  });

  it('deve manter a ordem recebida quando há várias atividades', () => {
    // Arrange
    const entrada = [
      atividade({ id: 'b', criadaEm: '2026-01-03T10:00:00Z' }),
      atividade({ id: 'a', criadaEm: '2026-01-01T10:00:00Z' }),
      atividade({ id: 'c', criadaEm: '2026-01-02T10:00:00Z' }),
    ];

    // Act
    const ids = historicoDaSolicitacao(entrada).map((item) => item.id);

    // Assert
    expect(ids).toEqual(['b', 'a', 'c']);
  });

  it('deve devolver lista vazia quando não há atividades', () => {
    // Arrange
    const entrada: AtividadeSolicitacao[] = [];

    // Act
    const resultado = historicoDaSolicitacao(entrada);

    // Assert
    expect(resultado).toEqual([]);
  });

  it('deve preservar o array de entrada quando gera o histórico', () => {
    // Arrange
    const entrada = [atividade({ id: 'x' }), atividade({ id: 'y' })];
    const copia = structuredClone(entrada);

    // Act
    historicoDaSolicitacao(entrada);

    // Assert
    expect(entrada).toEqual(copia);
  });
});

describe('iniciaisDe', () => {
  it('deve devolver a primeira e a última inicial quando o nome tem duas palavras', () => {
    // Arrange
    const nome = 'Ana Souza';

    // Act
    const resultado = iniciaisDe(nome);

    // Assert
    expect(resultado).toBe('AS');
  });

  it('deve devolver a primeira e a última inicial quando o nome tem três palavras', () => {
    // Arrange
    const nome = 'Maria da Silva';

    // Act
    const resultado = iniciaisDe(nome);

    // Assert
    expect(resultado).toBe('MS');
  });

  it('deve devolver uma letra quando o nome tem uma palavra', () => {
    // Arrange
    const nome = 'ana';

    // Act
    const resultado = iniciaisDe(nome);

    // Assert
    expect(resultado).toBe('A');
  });

  it('deve ignorar a palavra quando ela começa por número', () => {
    // Arrange
    const nome = 'operador5 1791396184425';

    // Act
    const resultado = iniciaisDe(nome);

    // Assert
    expect(resultado).toBe('O');
  });

  it.each(['', '   '])('deve devolver interrogação quando o nome é "%s"', (nome) => {
    // Arrange
    const entrada = nome;

    // Act
    const resultado = iniciaisDe(entrada);

    // Assert
    expect(resultado).toBe('?');
  });
});
