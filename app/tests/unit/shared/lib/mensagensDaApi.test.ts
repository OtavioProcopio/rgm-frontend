import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/api/apiError';
import { mensagemDaApi } from '@/shared/lib/mensagensDaApi';

describe('mensagemDaApi', () => {
  it('deve devolver a mensagem de sessão expirada quando o status é 401', () => {
    // Arrange
    const error = new ApiError({ status: 401, message: 'Unauthorized' });

    // Act
    const mensagem = mensagemDaApi(error);

    // Assert
    expect(mensagem).toBe('Sua sessão expirou. Entre novamente.');
  });

  it('deve devolver a mensagem de sem acesso quando o texto é a frase conhecida do backend', () => {
    // Arrange
    const error = new ApiError({
      status: 403,
      message: 'Usuario nao tem acesso a esta solicitacao',
    });

    // Act
    const mensagem = mensagemDaApi(error);

    // Assert
    expect(mensagem).toBe('Você não tem acesso a esta solicitação.');
  });

  it('deve devolver a mensagem de conflito quando o texto é a frase de bloqueio otimista', () => {
    // Arrange
    const error = new ApiError({
      status: 409,
      message: 'Este registro foi alterado por outro usuario. Recarregue e tente novamente.',
    });

    // Act
    const mensagem = mensagemDaApi(error);

    // Assert
    expect(mensagem).toBe(
      'Este registro foi alterado por outra pessoa. Recarregue e tente novamente.',
    );
  });

  it('deve devolver null quando o status é 409 e o texto é de registro duplicado', () => {
    // Arrange
    const error = new ApiError({
      status: 409,
      message: 'Registro duplicado ou violacao de integridade',
    });

    // Act
    const mensagem = mensagemDaApi(error);

    // Assert
    expect(mensagem).toBeNull();
  });

  it('deve devolver null quando o status é 403 e o texto é desconhecido', () => {
    // Arrange
    const error = new ApiError({ status: 403, message: 'Sem permissão' });

    // Act
    const mensagem = mensagemDaApi(error);

    // Assert
    expect(mensagem).toBeNull();
  });

  it('deve devolver a mensagem do tamanho da senha quando o texto é a frase conhecida', () => {
    // Arrange
    const error = new ApiError({
      status: 400,
      message: 'Senha deve ter no minimo 8 caracteres',
    });

    // Act
    const mensagem = mensagemDaApi(error);

    // Assert
    expect(mensagem).toBe('A senha deve ter no mínimo 8 caracteres.');
  });

  it('deve devolver a mensagem de senha atual incorreta quando o texto vem em outra caixa', () => {
    // Arrange
    const error = new ApiError({ status: 400, message: 'SENHA ATUAL INCORRETA' });

    // Act
    const mensagem = mensagemDaApi(error);

    // Assert
    expect(mensagem).toBe('Senha atual incorreta.');
  });

  it('deve preferir a frase conhecida ao status quando o status 401 e a frase conhecida coincidem', () => {
    // Arrange
    const error = new ApiError({
      status: 401,
      message: 'Senha deve ter no minimo 8 caracteres',
    });

    // Act
    const mensagem = mensagemDaApi(error);

    // Assert
    expect(mensagem).toBe('A senha deve ter no mínimo 8 caracteres.');
  });

  it('deve devolver null quando o status é 500', () => {
    // Arrange
    const error = new ApiError({ status: 500, message: 'Internal Server Error' });

    // Act
    const mensagem = mensagemDaApi(error);

    // Assert
    expect(mensagem).toBeNull();
  });

  it('deve devolver null quando o status é 400 e o texto é desconhecido', () => {
    // Arrange
    const error = new ApiError({ status: 400, message: 'Campo inválido' });

    // Act
    const mensagem = mensagemDaApi(error);

    // Assert
    expect(mensagem).toBeNull();
  });

  it('deve devolver null quando o erro é um Error comum', () => {
    // Arrange
    const error = new Error('Senha atual incorreta');

    // Act
    const mensagem = mensagemDaApi(error);

    // Assert
    expect(mensagem).toBeNull();
  });

  it('deve devolver null quando o valor não é um erro', () => {
    // Arrange
    const error = 'falha';

    // Act
    const mensagem = mensagemDaApi(error);

    // Assert
    expect(mensagem).toBeNull();
  });
});
