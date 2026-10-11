import { describe, expect, it } from 'vitest';

import type { PerfilUsuario } from '@/features/auth/types/authTypes';
import { destinosDeNavegacao } from '@/shared/lib/navegacao';
import type { DestinoDeNavegacao } from '@/shared/lib/navegacao';

const DASHBOARD: DestinoDeNavegacao = {
  id: 'dashboard',
  to: '/app/dashboard',
  rotulo: 'Dashboard',
  end: false,
};
const SOLICITACOES: DestinoDeNavegacao = {
  id: 'solicitacoes',
  to: '/app/solicitacoes',
  rotulo: 'Solicitações',
  end: false,
};
const MODELOS_ADMIN: DestinoDeNavegacao = {
  id: 'modelos',
  to: '/app/admin/modelos',
  rotulo: 'Modelos',
  end: false,
};
const MODELOS_COMUM: DestinoDeNavegacao = { ...MODELOS_ADMIN, to: '/app/modelos' };
const ADMIN: DestinoDeNavegacao = {
  id: 'admin',
  to: '/app/admin',
  rotulo: 'Painel Admin',
  end: true,
};
const USUARIOS: DestinoDeNavegacao = {
  id: 'usuarios',
  to: '/app/admin/usuarios',
  rotulo: 'Usuários',
  end: false,
};

const PERFIS: Array<PerfilUsuario | undefined> = [
  'ADMINISTRADOR',
  'GESTOR',
  'OPERADOR',
  'EXTERNO',
  undefined,
];

describe('destinosDeNavegacao', () => {
  it('deve devolver os cinco destinos na ordem quando o perfil e ADMINISTRADOR', () => {
    // Arrange
    const perfil: PerfilUsuario = 'ADMINISTRADOR';

    // Act
    const destinos = destinosDeNavegacao(perfil);

    // Assert
    expect(destinos).toEqual([DASHBOARD, SOLICITACOES, MODELOS_ADMIN, ADMIN, USUARIOS]);
  });

  it('deve devolver tres destinos com modelos de gestao quando o perfil e GESTOR', () => {
    // Arrange
    const perfil: PerfilUsuario = 'GESTOR';

    // Act
    const destinos = destinosDeNavegacao(perfil);

    // Assert
    expect(destinos).toEqual([DASHBOARD, SOLICITACOES, MODELOS_ADMIN]);
  });

  it.each<[string, PerfilUsuario | undefined]>([
    ['OPERADOR', 'OPERADOR'],
    ['EXTERNO', 'EXTERNO'],
    ['indefinido', undefined],
  ])('deve devolver tres destinos com modelos comuns quando o perfil e %s', (_nome, perfil) => {
    // Arrange
    const esperado = [DASHBOARD, SOLICITACOES, MODELOS_COMUM];

    // Act
    const destinos = destinosDeNavegacao(perfil);

    // Assert
    expect(destinos).toEqual(esperado);
  });

  it.each(PERFIS)('deve limitar a cinco destinos quando o perfil e %s', (perfil) => {
    // Arrange
    const limite = 5;

    // Act
    const destinos = destinosDeNavegacao(perfil);

    // Assert
    expect(destinos.length).toBeLessThanOrEqual(limite);
  });

  it('deve marcar end verdadeiro apenas no Painel Admin quando o perfil e ADMINISTRADOR', () => {
    // Arrange
    const perfil: PerfilUsuario = 'ADMINISTRADOR';

    // Act
    const comEnd = destinosDeNavegacao(perfil).filter((destino) => destino.end);

    // Assert
    expect(comEnd).toEqual([ADMIN]);
  });

  it('deve devolver ids unicos quando o perfil e ADMINISTRADOR', () => {
    // Arrange
    const perfil: PerfilUsuario = 'ADMINISTRADOR';

    // Act
    const ids = destinosDeNavegacao(perfil).map((destino) => destino.id);

    // Assert
    expect(new Set(ids).size).toBe(ids.length);
  });
});
