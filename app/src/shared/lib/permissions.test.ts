import { describe, expect, it } from 'vitest';

import {
  canAccessAdmin,
  canManageModelos,
  canManageSolicitacoes,
  canOperateSolicitacoes,
  canViewModelos,
  getDefaultRoute,
} from './permissions';

describe('permissions', () => {
  it('allows only administrators to access admin UX', () => {
    expect(canAccessAdmin('ADMINISTRADOR')).toBe(true);
    expect(canAccessAdmin('GESTOR')).toBe(false);
    expect(canAccessAdmin('OPERADOR')).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
    expect(canAccessAdmin(undefined)).toBe(false);
  });

  it('allows gestores and administrators to manage modelos', () => {
    expect(canManageModelos('ADMINISTRADOR')).toBe(true);
    expect(canManageModelos('GESTOR')).toBe(true);
    expect(canManageModelos('OPERADOR')).toBe(false);
    expect(canManageModelos(null)).toBe(false);
  });

  it('allows operational profiles to use solicitacoes UX', () => {
    expect(canOperateSolicitacoes('ADMINISTRADOR')).toBe(true);
    expect(canOperateSolicitacoes('GESTOR')).toBe(true);
    expect(canOperateSolicitacoes('OPERADOR')).toBe(true);
    expect(canOperateSolicitacoes('EXTERNO')).toBe(false);
    expect(canOperateSolicitacoes(null)).toBe(false);
  });

  it('allows only ADMIN and GESTOR to manage solicitacoes', () => {
    expect(canManageSolicitacoes('ADMINISTRADOR')).toBe(true);
    expect(canManageSolicitacoes('GESTOR')).toBe(true);
    expect(canManageSolicitacoes('OPERADOR')).toBe(false);
    expect(canManageSolicitacoes('EXTERNO')).toBe(false);
    expect(canManageSolicitacoes(null)).toBe(false);
  });

  it('allows logged-in operational profiles to view modelos', () => {
    expect(canViewModelos('ADMINISTRADOR')).toBe(true);
    expect(canViewModelos('GESTOR')).toBe(true);
    expect(canViewModelos('OPERADOR')).toBe(true);
    expect(canViewModelos('EXTERNO')).toBe(false);
    expect(canViewModelos(null)).toBe(false);
  });

  it('routes ADMINISTRADOR to /app/admin and all others to /app/solicitacoes', () => {
    expect(getDefaultRoute('ADMINISTRADOR')).toBe('/app/admin');
    expect(getDefaultRoute('GESTOR')).toBe('/app/solicitacoes');
    expect(getDefaultRoute('OPERADOR')).toBe('/app/solicitacoes');
    expect(getDefaultRoute(null)).toBe('/app/solicitacoes');
    expect(getDefaultRoute(undefined)).toBe('/app/solicitacoes');
  });
});
