import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/api/apiError';

import { getTipoModeloErrorMessage } from '@/features/admin/tiposModelo/lib/tipoModeloMessages';

describe('getTipoModeloErrorMessage', () => {
  it('returns generic message for non-ApiError', () => {
    expect(getTipoModeloErrorMessage(new Error('qualquer'))).toBe(
      'Não foi possível concluir a operação. Tente novamente.',
    );
  });

  it('returns generic message for non-error values', () => {
    expect(getTipoModeloErrorMessage(null)).toBe(
      'Não foi possível concluir a operação. Tente novamente.',
    );
  });

  it('returns duplicate name message for matching backend error', () => {
    expect(
      getTipoModeloErrorMessage(
        new ApiError({ status: 400, message: 'Ja existe um tipo de modelo com esse nome' }),
      ),
    ).toBe('Já existe um tipo de modelo com esse nome.');
  });

  it('returns session expired for 401', () => {
    expect(getTipoModeloErrorMessage(new ApiError({ status: 401, message: '' }))).toBe(
      'Sessão expirada. Faça login novamente.',
    );
  });

  it('returns permission message for 403', () => {
    expect(getTipoModeloErrorMessage(new ApiError({ status: 403, message: 'Sem permissão' }))).toBe(
      'Sem permissão',
    );
  });

  it('returns fallback for 403 with empty message', () => {
    expect(getTipoModeloErrorMessage(new ApiError({ status: 403, message: '' }))).toBe(
      'Você não tem permissão para gerenciar o catálogo de tipos de modelo.',
    );
  });

  it('returns not found for 404', () => {
    expect(getTipoModeloErrorMessage(new ApiError({ status: 404, message: '' }))).toBe(
      'Tipo de modelo não encontrado.',
    );
  });

  it('returns internal error for 500', () => {
    expect(getTipoModeloErrorMessage(new ApiError({ status: 500, message: '' }))).toBe(
      'Erro interno. Tente novamente mais tarde.',
    );
  });

  it('returns api message for other status codes', () => {
    expect(getTipoModeloErrorMessage(new ApiError({ status: 409, message: 'Conflito' }))).toBe(
      'Conflito',
    );
  });

  it('returns generic for other status with empty message', () => {
    expect(getTipoModeloErrorMessage(new ApiError({ status: 409, message: '' }))).toBe(
      'Não foi possível concluir a operação. Tente novamente.',
    );
  });
});
