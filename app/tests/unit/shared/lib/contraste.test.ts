import { describe, expect, it } from 'vitest';

import { contraste, luminancia } from '@/shared/lib/contraste';

describe('luminancia', () => {
  it('deve ser 0 quando a cor é preta', () => {
    // Act
    const valor = luminancia('#000000');

    // Assert
    expect(valor).toBe(0);
  });

  it('deve ser 1 quando a cor é branca', () => {
    // Act
    const valor = luminancia('#ffffff');

    // Assert
    expect(valor).toBeCloseTo(1, 5);
  });
});

describe('contraste', () => {
  it('deve dar 21:1 quando as cores são preto e branco', () => {
    // Act
    const razao = contraste('#000000', '#ffffff');

    // Assert
    expect(razao).toBeCloseTo(21, 5);
  });

  it('deve dar 1:1 quando as duas cores são iguais', () => {
    // Act
    const razao = contraste('#ffffff', '#ffffff');

    // Assert
    expect(razao).toBe(1);
  });

  it('deve dar o mesmo resultado quando a ordem das cores é trocada', () => {
    // Arrange
    const texto = '#1d4ed8';
    const fundo = '#f8fafc';

    // Act
    const razoes = [contraste(texto, fundo), contraste(fundo, texto)];

    // Assert
    expect(razoes[0]).toBe(razoes[1]);
  });

  it('deve ficar logo acima de 4,5:1 quando o cinza #767676 está sobre branco', () => {
    // Act
    const razao = contraste('#767676', '#ffffff');

    // Assert
    expect(razao).toBeCloseTo(4.54, 2);
  });

  it('deve ficar abaixo de 4,5:1 quando o cinza #777777 está sobre branco', () => {
    // Act
    const razao = contraste('#777777', '#ffffff');

    // Assert
    expect(razao).toBeLessThan(4.5);
  });

  it('deve aceitar cor escrita com 3 dígitos', () => {
    // Act
    const razao = contraste('#000', '#fff');

    // Assert
    expect(razao).toBeCloseTo(21, 5);
  });

  it('deve aceitar letras maiúsculas na cor', () => {
    // Act
    const razao = contraste('#FFFFFF', '#000000');

    // Assert
    expect(razao).toBeCloseTo(21, 5);
  });

  it.each(['azul', '#12', '#gggggg', 'rgb(0, 0, 0)', ''])(
    'deve recusar a cor "%s", que não está em hexadecimal',
    (cor) => {
      // Act
      const calcular = () => contraste(cor, '#ffffff');

      // Assert
      expect(calcular).toThrow(`Cor inválida: "${cor}"`);
    },
  );
});
