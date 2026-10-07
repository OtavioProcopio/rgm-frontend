import { describe, expect, it } from 'vitest';

import { credenciaisDaTroca } from '@/features/auth/lib/credenciaisDaTroca';
import type { SenhaAlteradaResponse } from '@/features/auth/types/authTypes';

const USUARIO = {
  id: 'u-1',
  nome: 'Ana',
  email: 'ana@empresa.com.br',
  perfil: 'OPERADOR',
  ativo: true,
  criadoEm: '2026-10-01T10:00:00Z',
  atualizadoEm: '2026-10-07T10:00:00Z',
} as const;

function resposta(extra: Partial<SenhaAlteradaResponse>): SenhaAlteradaResponse {
  return { ...USUARIO, ...extra };
}

describe('credenciaisDaTroca', () => {
  it('deve devolver o par de credenciais quando a resposta traz as duas', () => {
    // Arrange
    const recebida = resposta({ token: 'acesso-novo', refreshToken: 'renovacao-nova' });

    // Act
    const credenciais = credenciaisDaTroca(recebida);

    // Assert
    expect(credenciais).toEqual({ token: 'acesso-novo', refreshToken: 'renovacao-nova' });
  });

  it('deve devolver nulo quando a resposta não traz a credencial de acesso', () => {
    // Arrange
    const recebida = resposta({ refreshToken: 'renovacao-nova' });

    // Act
    const credenciais = credenciaisDaTroca(recebida);

    // Assert
    expect(credenciais).toBeNull();
  });

  it('deve devolver nulo quando a resposta não traz a credencial de renovação', () => {
    // Arrange
    const recebida = resposta({ token: 'acesso-novo' });

    // Act
    const credenciais = credenciaisDaTroca(recebida);

    // Assert
    expect(credenciais).toBeNull();
  });

  it.each([
    ['acesso', { token: '', refreshToken: 'renovacao-nova' }],
    ['renovação', { token: 'acesso-novo', refreshToken: '' }],
  ])('deve devolver nulo quando a credencial de %s vem vazia', (_nome, extra) => {
    // Arrange
    const recebida = resposta(extra);

    // Act
    const credenciais = credenciaisDaTroca(recebida);

    // Assert
    expect(credenciais).toBeNull();
  });

  it('deve devolver nulo quando a API responde sem corpo', () => {
    // Act
    const credenciais = credenciaisDaTroca(undefined);

    // Assert
    expect(credenciais).toBeNull();
  });
});
