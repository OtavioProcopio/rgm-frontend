import { describe, expect, it } from 'vitest';

import { formatarPercentual, leituraDoPrazo } from '@/features/solicitacoes/lib/leituraDoPrazo';

describe('leituraDoPrazo', () => {
  it.each([
    [100, 'ok'],
    [90, 'ok'],
    [89.9, 'atencao'],
    [75, 'atencao'],
    [74.9, 'ruim'],
    [0, 'ruim'],
  ] as const)('deve dar o tom certo quando o prazo cumprido é %s%%', (percentual, tom) => {
    // Arrange
    const valor = percentual;

    // Act
    const leitura = leituraDoPrazo(valor);

    // Assert
    expect(leitura.tom).toBe(tom);
  });

  it('deve dizer que não há base quando não houve concluídas', () => {
    // Arrange
    const valor = null;

    // Act
    const leitura = leituraDoPrazo(valor);

    // Assert
    expect(leitura).toEqual({ tom: 'neutro', texto: 'Sem concluídas no período' });
  });

  it('deve citar a meta de 90% no texto quando o prazo está abaixo dela', () => {
    // Arrange
    const valor = 80;

    // Act
    const leitura = leituraDoPrazo(valor);

    // Assert
    expect(leitura.texto).toContain('90%');
  });
});

describe('formatarPercentual', () => {
  it.each([
    [100, '100%'],
    [85, '85%'],
    [16.7, '16,7%'],
    [null, '—'],
  ] as const)('deve formatar %s como %s', (valor, esperado) => {
    // Arrange
    const entrada = valor;

    // Act
    const texto = formatarPercentual(entrada);

    // Assert
    expect(texto).toBe(esperado);
  });
});
