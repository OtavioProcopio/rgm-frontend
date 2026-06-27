import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/api/apiError';

import { getModeloErrorMessage } from './modeloMessages';

describe('getModeloErrorMessage', () => {
  it('returns generic message for non-ApiError', () => {
    expect(getModeloErrorMessage(new Error('qualquer'))).toBe(
      'Não foi possível concluir a operação. Tente novamente.',
    );
  });

  it('returns generic message for non-error values', () => {
    expect(getModeloErrorMessage(null)).toBe(
      'Não foi possível concluir a operação. Tente novamente.',
    );
  });

  it('returns "Modelo não encontrado" for matching message', () => {
    expect(getModeloErrorMessage(new ApiError({ status: 404, message: 'modelo nao encontrado' }))).toBe(
      'Modelo não encontrado.',
    );
  });

  it('returns "Máquina não encontrada" for matching message', () => {
    expect(getModeloErrorMessage(new ApiError({ status: 404, message: 'maquina nao encontrada' }))).toBe(
      'Máquina não encontrada.',
    );
  });

  it('returns session expired for 401', () => {
    expect(getModeloErrorMessage(new ApiError({ status: 401, message: '' }))).toBe(
      'Sessão expirada. Faça login novamente.',
    );
  });

  it('returns permission message for 403', () => {
    expect(getModeloErrorMessage(new ApiError({ status: 403, message: 'Sem permissão' }))).toBe(
      'Sem permissão',
    );
  });

  it('returns fallback for 403 with empty message', () => {
    expect(getModeloErrorMessage(new ApiError({ status: 403, message: '' }))).toBe(
      'Você não tem permissão para esta ação.',
    );
  });

  it('returns internal error for 500', () => {
    expect(getModeloErrorMessage(new ApiError({ status: 500, message: '' }))).toBe(
      'Erro interno. Tente novamente mais tarde.',
    );
  });

  it('returns api message for other status codes', () => {
    expect(getModeloErrorMessage(new ApiError({ status: 409, message: 'Conflito' }))).toBe('Conflito');
  });

  it('returns generic for other status with empty message', () => {
    expect(getModeloErrorMessage(new ApiError({ status: 409, message: '' }))).toBe(
      'Não foi possível concluir a operação. Tente novamente.',
    );
  });
});
