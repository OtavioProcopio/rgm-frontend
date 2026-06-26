import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/api/apiError';

import { getUsuarioErrorMessage } from './usuarioMessages';

describe('getUsuarioErrorMessage', () => {
  it('returns generic message for non-ApiError', () => {
    expect(getUsuarioErrorMessage(new Error('qualquer'))).toBe(
      'Não foi possível concluir a operação. Tente novamente.',
    );
  });

  it('returns "e-mail já cadastrado" when message contains email ja cadastrado', () => {
    expect(getUsuarioErrorMessage(new ApiError({ status: 409, message: 'email ja cadastrado' }))).toBe(
      'Este e-mail já está cadastrado.',
    );
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
    expect(getUsuarioErrorMessage(new ApiError({ status: 422, message: 'Inválido' }))).toBe('Inválido');
  });
});
