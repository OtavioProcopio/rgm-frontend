import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/api/apiError';

import { esperaDaTentativa, sessaoExpirou } from './reconexao';

describe('esperaDaTentativa', () => {
  it.each([
    [1, 3_000],
    [2, 6_000],
    [3, 12_000],
    [4, 24_000],
    [5, 30_000],
    [6, 30_000],
    [50, 30_000],
  ])('deve esperar, na tentativa %i, %i ms', (tentativa, esperado) => {
    // Act
    const espera = esperaDaTentativa(tentativa);

    // Assert
    expect(espera).toBe(esperado);
  });

  it('deve usar a espera inicial quando a tentativa informada é menor que 1', () => {
    // Act
    const espera = esperaDaTentativa(0);

    // Assert
    expect(espera).toBe(3_000);
  });
});

describe('sessaoExpirou', () => {
  it.each([400, 401, 403])(
    'deve considerar a sessão expirada quando a renovação é recusada com %i',
    (status) => {
      // Arrange
      const erro = new ApiError({ status, message: 'Sessão expirada.' });

      // Act
      const expirou = sessaoExpirou(erro);

      // Assert
      expect(expirou).toBe(true);
    },
  );

  it.each([500, 502, 503])(
    'deve considerar falha passageira quando o servidor responde %i',
    (status) => {
      // Arrange
      const erro = new ApiError({ status, message: 'Sessão expirada.' });

      // Act
      const expirou = sessaoExpirou(erro);

      // Assert
      expect(expirou).toBe(false);
    },
  );

  it('deve considerar falha passageira quando não há resposta da rede', () => {
    // Arrange
    const erro = new TypeError('Failed to fetch');

    // Act
    const expirou = sessaoExpirou(erro);

    // Assert
    expect(expirou).toBe(false);
  });
});
