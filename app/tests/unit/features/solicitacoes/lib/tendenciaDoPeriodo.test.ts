import { describe, expect, it } from 'vitest';

import {
  ehHoje,
  marcasDoEixo,
  rotuloDoPonto,
  rotuloDoUltimoPonto,
  semMovimento,
} from '@/features/solicitacoes/lib/tendenciaDoPeriodo';
import type { PontoDeSerie } from '@/features/solicitacoes/types/solicitacaoTypes';

function criarPonto(extra: Partial<PontoDeSerie> = {}): PontoDeSerie {
  return {
    periodo: '09/10',
    total: 0,
    abertas: 0,
    concluidas: 0,
    canceladas: 0,
    slaMediaHoras: 0,
    ...extra,
  };
}

describe('marcasDoEixo', () => {
  it.each([
    [437, [0, 250, 500]],
    [44, [0, 25, 50]],
    [3, [0, 2, 4]],
    [1, [0, 1, 2]],
    [2, [0, 1, 2]],
    [99, [0, 50, 100]],
    [100, [0, 50, 100]],
    [101, [0, 100, 200]],
  ])(
    'deve arredondar o topo ao próximo par até 10 e ao menor 1-2-5 x 10^n acima disso quando o máximo é %s',
    (maximo, esperado) => {
      // Arrange
      const entrada: number = maximo as number;

      // Act
      const marcas = marcasDoEixo(entrada);

      // Assert
      expect(marcas).toEqual(esperado);
    },
  );

  it.each([[0], [-5], [Number.NaN]])(
    'deve devolver o eixo mínimo quando o máximo é %s',
    (maximo) => {
      // Arrange
      const entrada: number = maximo;

      // Act
      const marcas = marcasDoEixo(entrada);

      // Assert
      expect(marcas).toEqual([0, 1, 2]);
    },
  );

  it('deve devolver sempre 3 marcas inteiras e crescentes quando o máximo varia', () => {
    // Arrange
    const maximos: number[] = Array.from({ length: 300 }, (_, i) => i + 0.5);

    // Act
    const todas: number[][] = maximos.map(marcasDoEixo);

    // Assert
    const validas = todas.every(
      (m) => m.length === 3 && m.every(Number.isInteger) && m[0] < m[1] && m[1] < m[2],
    );
    expect(validas).toBe(true);
  });

  it('deve comportar o máximo no topo quando ele é fracionário', () => {
    // Arrange
    const maximo = 12.3;

    // Act
    const marcas = marcasDoEixo(maximo);

    // Assert
    expect(marcas[2]).toBe(20);
  });
});

describe('semMovimento', () => {
  it('deve ser verdadeiro quando a série está vazia', () => {
    // Arrange
    const series: PontoDeSerie[] = [];

    // Act
    const resultado = semMovimento(series);

    // Assert
    expect(resultado).toBe(true);
  });

  it('deve ser verdadeiro quando todos os pontos têm abertas e concluídas zeradas', () => {
    // Arrange
    const series = [criarPonto(), criarPonto({ canceladas: 2 })];

    // Act
    const resultado = semMovimento(series);

    // Assert
    expect(resultado).toBe(true);
  });

  it('deve ser falso quando algum ponto tem abertas', () => {
    // Arrange
    const series = [criarPonto(), criarPonto({ abertas: 1 })];

    // Act
    const resultado = semMovimento(series);

    // Assert
    expect(resultado).toBe(false);
  });

  it('deve ser falso quando algum ponto tem concluídas', () => {
    // Arrange
    const series = [criarPonto({ concluidas: 3 }), criarPonto()];

    // Act
    const resultado = semMovimento(series);

    // Assert
    expect(resultado).toBe(false);
  });
});

describe('ehHoje', () => {
  it('deve ser verdadeiro quando o índice é o último', () => {
    // Arrange
    const indice = 6;

    // Act
    const resultado = ehHoje(indice, 7);

    // Assert
    expect(resultado).toBe(true);
  });

  it('deve ser falso quando o índice é o primeiro de vários', () => {
    // Arrange
    const indice = 0;

    // Act
    const resultado = ehHoje(indice, 7);

    // Assert
    expect(resultado).toBe(false);
  });

  it('deve ser falso quando o total é zero', () => {
    // Arrange
    const indice = -1;

    // Act
    const resultado = ehHoje(indice, 0);

    // Assert
    expect(resultado).toBe(false);
  });
});

describe('rotuloDoUltimoPonto', () => {
  it.each([
    [7, 'Hoje'],
    [30, 'Hoje'],
    [31, 'Esta semana'],
    [90, 'Esta semana'],
  ])('deve devolver o rótulo certo quando o período é de %s dias', (dias, esperado) => {
    // Arrange
    const periodo: number = dias as number;

    // Act
    const rotulo = rotuloDoUltimoPonto(periodo);

    // Assert
    expect(rotulo).toBe(esperado);
  });
});

describe('rotuloDoPonto', () => {
  it('deve usar o plural quando há mais de uma em cada contagem', () => {
    // Arrange
    const ponto = criarPonto({ total: 44, abertas: 33, concluidas: 5 });

    // Act
    const rotulo = rotuloDoPonto(ponto);

    // Assert
    expect(rotulo).toBe('09/10: 44 criadas, 33 ainda abertas, 5 concluídas');
  });

  it('deve usar o singular quando cada contagem é 1', () => {
    // Arrange
    const ponto = criarPonto({ total: 1, abertas: 1, concluidas: 1 });

    // Act
    const rotulo = rotuloDoPonto(ponto);

    // Assert
    expect(rotulo).toBe('09/10: 1 criada, 1 ainda aberta, 1 concluída');
  });

  it('deve usar o plural quando tudo é zero', () => {
    // Arrange
    const ponto = criarPonto();

    // Act
    const rotulo = rotuloDoPonto(ponto);

    // Assert
    expect(rotulo).toBe('09/10: 0 criadas, 0 ainda abertas, 0 concluídas');
  });
});
