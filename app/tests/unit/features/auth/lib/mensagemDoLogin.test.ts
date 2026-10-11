import { describe, expect, it } from 'vitest';

import {
  MENSAGEM_CREDENCIAL_INVALIDA,
  MENSAGEM_EXCESSO_DE_TENTATIVAS,
  MENSAGEM_LOGIN_DESCONHECIDO,
  MENSAGEM_SEM_CONEXAO,
  mensagemDoLogin,
} from '@/features/auth/lib/mensagemDoLogin';
import { ApiError } from '@/shared/api/apiError';

const apiError = (status: number) => new ApiError({ status, message: 'qualquer corpo' });

describe('mensagemDoLogin', () => {
  it.each([
    { caso: 'credencial inválida (401)', erro: apiError(401), esperada: MENSAGEM_CREDENCIAL_INVALIDA },
    { caso: 'excesso de tentativas (429)', erro: apiError(429), esperada: MENSAGEM_EXCESSO_DE_TENTATIVAS },
    { caso: 'erro do servidor (500)', erro: apiError(500), esperada: MENSAGEM_LOGIN_DESCONHECIDO },
    { caso: 'falta de conexão', erro: new TypeError('Failed to fetch'), esperada: MENSAGEM_SEM_CONEXAO },
    { caso: 'erro desconhecido', erro: new Error('x'), esperada: MENSAGEM_LOGIN_DESCONHECIDO },
  ])('deve devolver a mensagem de $caso quando o login falha assim', ({ erro, esperada }) => {
    // Act
    const mensagem = mensagemDoLogin(erro);

    // Assert
    expect(mensagem).toBe(esperada);
  });

  it('deve nunca repetir a mesma frase quando os três casos conhecidos são comparados', () => {
    // Arrange
    const erros = [apiError(401), apiError(429), new TypeError('Failed to fetch')];

    // Act
    const mensagens = erros.map(mensagemDoLogin);

    // Assert
    expect(new Set(mensagens).size).toBe(erros.length);
  });
});
