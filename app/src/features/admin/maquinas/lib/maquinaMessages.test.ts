import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/api/apiError';

import { getMaquinaErrorMessage } from './maquinaMessages';

describe('getMaquinaErrorMessage', () => {
  it('returns generic message for non-ApiError', () => {
    expect(getMaquinaErrorMessage(new Error('qualquer'))).toBe(
      'Não foi possível concluir a operação. Tente novamente.',
    );
  });

  it('returns generic message for non-error values', () => {
    expect(getMaquinaErrorMessage(null)).toBe(
      'Não foi possível concluir a operação. Tente novamente.',
    );
  });

  it('returns duplicate name message for matching backend error', () => {
    expect(
      getMaquinaErrorMessage(
        new ApiError({ status: 400, message: 'Ja existe uma maquina com esse nome' }),
      ),
    ).toBe('Já existe uma máquina com esse nome.');
  });

  it('returns session expired for 401', () => {
    expect(getMaquinaErrorMessage(new ApiError({ status: 401, message: '' }))).toBe(
      'Sessão expirada. Faça login novamente.',
    );
  });

  it('returns permission message for 403', () => {
    expect(getMaquinaErrorMessage(new ApiError({ status: 403, message: 'Sem permissão' }))).toBe(
      'Sem permissão',
    );
  });

  it('returns fallback for 403 with empty message', () => {
    expect(getMaquinaErrorMessage(new ApiError({ status: 403, message: '' }))).toBe(
      'Você não tem permissão para gerenciar o catálogo de máquinas.',
    );
  });

  it('returns not found for 404', () => {
    expect(getMaquinaErrorMessage(new ApiError({ status: 404, message: '' }))).toBe(
      'Máquina não encontrada.',
    );
  });

  it('returns internal error for 500', () => {
    expect(getMaquinaErrorMessage(new ApiError({ status: 500, message: '' }))).toBe(
      'Erro interno. Tente novamente mais tarde.',
    );
  });

  it('returns api message for other status codes', () => {
    expect(getMaquinaErrorMessage(new ApiError({ status: 409, message: 'Conflito' }))).toBe(
      'Conflito',
    );
  });

  it('returns generic for other status with empty message', () => {
    expect(getMaquinaErrorMessage(new ApiError({ status: 409, message: '' }))).toBe(
      'Não foi possível concluir a operação. Tente novamente.',
    );
  });
});
