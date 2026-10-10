import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/api/apiError';

import { getUsuarioErrorMessage } from '@/features/admin/usuarios/lib/usuarioMessages';

describe('getUsuarioErrorMessage', () => {
  it('returns generic message for non-ApiError', () => {
    expect(getUsuarioErrorMessage(new Error('qualquer'))).toBe(
      'Não foi possível concluir a operação. Tente novamente.',
    );
  });

  it('returns "e-mail já cadastrado" when message contains email ja cadastrado', () => {
    expect(
      getUsuarioErrorMessage(new ApiError({ status: 409, message: 'email ja cadastrado' })),
    ).toBe('Este e-mail já está cadastrado.');
  });

  it('returns session expired for 401', () => {
    expect(getUsuarioErrorMessage(new ApiError({ status: 401, message: '' }))).toBe(
      'Sessão expirada. Faça login novamente.',
    );
  });

  it('returns permission message for 403', () => {
    expect(getUsuarioErrorMessage(new ApiError({ status: 403, message: 'Acesso negado' }))).toBe(
      'Acesso negado',
    );
  });

  it('returns fallback for 403 with empty message', () => {
    expect(getUsuarioErrorMessage(new ApiError({ status: 403, message: '' }))).toBe(
      'Você não tem permissão para acessar esta área.',
    );
  });

  it('returns internal error for 500', () => {
    expect(getUsuarioErrorMessage(new ApiError({ status: 500, message: '' }))).toBe(
      'Erro interno. Tente novamente mais tarde.',
    );
  });

  it('returns api message for other status codes', () => {
    expect(getUsuarioErrorMessage(new ApiError({ status: 422, message: 'Inválido' }))).toBe(
      'Inválido',
    );
  });

  it('deve mostrar a mensagem conhecida da senha quando o status é 400 e o texto é conhecido', () => {
    // Arrange
    const erro = new ApiError({
      status: 400,
      message: 'Senha deve ter no minimo 8 caracteres',
    });

    // Act
    const mensagem: string = getUsuarioErrorMessage(erro);

    // Assert
    expect(mensagem).toBe('A senha deve ter no mínimo 8 caracteres.');
  });

  it('returns fallback for default status with empty message', () => {
    expect(getUsuarioErrorMessage(new ApiError({ status: 422, message: '' }))).toBe(
      'Não foi possível concluir a operação. Tente novamente.',
    );
  });
});
