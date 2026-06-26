import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/api/apiError';

import {
  getSolicitacaoErrorMessage,
  prioridadeLabel,
  statusLabel,
  tipoLabel,
} from './solicitacaoMessages';

describe('solicitacaoMessages', () => {
  it('statusLabel covers all statuses', () => {
    expect(statusLabel['A_FAZER']).toBe('A fazer');
    expect(statusLabel['EM_ANDAMENTO']).toBe('Em andamento');
    expect(statusLabel['EM_VALIDACAO']).toBe('Em validação');
    expect(statusLabel['CONCLUIDA']).toBe('Concluída');
    expect(statusLabel['CANCELADA']).toBe('Cancelada');
  });

  it('prioridadeLabel covers all priorities', () => {
    expect(prioridadeLabel['BAIXA']).toBe('Baixa');
    expect(prioridadeLabel['MEDIA']).toBe('Média');
    expect(prioridadeLabel['ALTA']).toBe('Alta');
    expect(prioridadeLabel['URGENTE']).toBe('Urgente');
  });

  it('tipoLabel covers all types', () => {
    expect(tipoLabel['REPARO']).toBe('Reparo');
    expect(tipoLabel['INSPECAO']).toBe('Inspeção');
    expect(tipoLabel['REENGENHARIA']).toBe('Reengenharia');
  });

  it('getSolicitacaoErrorMessage returns ApiError message when available', () => {
    const err = new ApiError({ status: 403, message: 'Acesso negado' });
    expect(getSolicitacaoErrorMessage(err)).toBe('Acesso negado');
  });

  it('getSolicitacaoErrorMessage returns generic message for unknown errors', () => {
    expect(getSolicitacaoErrorMessage(new Error('qualquer'))).toBe('Ocorreu um erro inesperado.');
    expect(getSolicitacaoErrorMessage('string')).toBe('Ocorreu um erro inesperado.');
    expect(getSolicitacaoErrorMessage(null)).toBe('Ocorreu um erro inesperado.');
  });
});
