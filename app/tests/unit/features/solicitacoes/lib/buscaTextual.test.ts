import { describe, expect, it } from 'vitest';

import { buscaCurtaDemais, termoDeBusca } from '@/features/solicitacoes/lib/buscaTextual';

describe('termoDeBusca', () => {
  it('deve apará-lo quando o termo tem espaços nas pontas', () => {
    // Arrange
    const texto = '  correia  ';

    // Act
    const termo = termoDeBusca(texto);

    // Assert
    expect(termo).toBe('correia');
  });

  it('deve ignorar o termo quando tem menos de 2 caracteres', () => {
    // Arrange
    const texto = ' a ';

    // Act
    const termo = termoDeBusca(texto);

    // Assert
    expect(termo).toBeUndefined();
  });

  it('deve ignorar o termo quando está em branco ou ausente', () => {
    // Act
    const branco = termoDeBusca('   ');
    const ausente = termoDeBusca(null);

    // Assert
    expect(branco).toBeUndefined();
    expect(ausente).toBeUndefined();
  });

  it('deve cortar em 100 caracteres quando o termo é maior', () => {
    // Arrange
    const texto = 'a'.repeat(150);

    // Act
    const termo = termoDeBusca(texto);

    // Assert
    expect(termo).toHaveLength(100);
  });
});

describe('buscaCurtaDemais', () => {
  it('deve dizer que é curto quando há 1 caractere', () => {
    // Act
    const curto = buscaCurtaDemais('a');

    // Assert
    expect(curto).toBe(true);
  });

  it('deve não dizer que é curto quando o campo está vazio', () => {
    // Act
    const curto = buscaCurtaDemais('');

    // Assert
    expect(curto).toBe(false);
  });

  it('deve não dizer que é curto quando há 2 caracteres', () => {
    // Act
    const curto = buscaCurtaDemais('ab');

    // Assert
    expect(curto).toBe(false);
  });
});
