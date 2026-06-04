import { describe, expect, it } from 'vitest';

import { canAccessAdmin, canManageModelos, canOperateSolicitacoes } from './permissions';

describe('permissions', () => {
  it('allows only administrators to access admin UX', () => {
    expect(canAccessAdmin('ADMINISTRADOR')).toBe(true);
    expect(canAccessAdmin('GESTOR')).toBe(false);
  });

  it('allows gestores and administrators to manage modelos', () => {
    expect(canManageModelos('ADMINISTRADOR')).toBe(true);
    expect(canManageModelos('GESTOR')).toBe(true);
    expect(canManageModelos('OPERADOR')).toBe(false);
  });

  it('allows operational profiles to use solicitacoes UX', () => {
    expect(canOperateSolicitacoes('ADMINISTRADOR')).toBe(true);
    expect(canOperateSolicitacoes('GESTOR')).toBe(true);
    expect(canOperateSolicitacoes('OPERADOR')).toBe(true);
    expect(canOperateSolicitacoes('EXTERNO')).toBe(false);
  });
});
