import { describe, expect, it } from 'vitest';

import {
  iniciaisDoNome,
  responsaveisDoCard,
} from '@/features/solicitacoes/lib/iniciaisDosResponsaveis';

describe('iniciaisDoNome', () => {
  it('deve usar a primeira letra do primeiro e do último nome quando há vários nomes', () => {
    // Arrange
    const nome = 'Maria da Silva';

    // Act
    const iniciais = iniciaisDoNome(nome);

    // Assert
    expect(iniciais).toBe('MS');
  });

  it('deve usar uma letra só quando o nome é uma palavra', () => {
    // Arrange
    const nome = 'zélia';

    // Act
    const iniciais = iniciaisDoNome(nome);

    // Assert
    expect(iniciais).toBe('Z');
  });

  it('deve devolver ponto de interrogação quando o nome está em branco', () => {
    // Arrange
    const nome = '   ';

    // Act
    const iniciais = iniciaisDoNome(nome);

    // Assert
    expect(iniciais).toBe('?');
  });
});

describe('responsaveisDoCard', () => {
  it('deve limitar a três iniciais e contar os restantes quando há mais responsáveis', () => {
    // Arrange
    const responsaveis = ['Ana Lima', 'Beto Souza', 'Caio Rocha', 'Dora Alves'].map((nome, i) => ({
      id: String(i),
      nome,
    }));

    // Act
    const resultado = responsaveisDoCard({
      responsavelIds: responsaveis.map((r) => r.id),
      responsaveis,
    });

    // Assert
    expect(resultado.iniciais).toEqual(['AL', 'BS', 'CR']);
    expect(resultado.restantes).toBe(1);
    expect(resultado.nomes).toBe('Ana Lima, Beto Souza, Caio Rocha, Dora Alves');
  });

  it('deve contar os ids quando a API não informou os nomes', () => {
    // Arrange
    const solicitacao = { responsavelIds: ['a', 'b'], responsaveis: null };

    // Act
    const resultado = responsaveisDoCard(solicitacao);

    // Assert
    expect(resultado.iniciais).toEqual([]);
    expect(resultado.restantes).toBe(2);
    expect(resultado.nomes).toBe('');
  });
});
