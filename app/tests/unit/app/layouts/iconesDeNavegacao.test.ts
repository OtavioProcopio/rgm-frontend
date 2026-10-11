import { describe, expect, it } from 'vitest';

import { ICONES_DE_NAVEGACAO } from '@/app/layouts/iconesDeNavegacao';
import type { PerfilUsuario } from '@/features/auth/types/authTypes';
import { destinosDeNavegacao } from '@/shared/lib/navegacao';

const PERFIS: (PerfilUsuario | undefined)[] = [
  'ADMINISTRADOR',
  'GESTOR',
  'OPERADOR',
  'EXTERNO',
  undefined,
];

describe('ICONES_DE_NAVEGACAO', () => {
  it.each(PERFIS)('deve ter um ícone para cada destino quando o perfil é %s', (perfil) => {
    // Arrange
    const destinos = destinosDeNavegacao(perfil);

    // Act
    const semIcone = destinos.filter((destino) => !ICONES_DE_NAVEGACAO[destino.id]);

    // Assert
    expect(semIcone).toEqual([]);
  });
});
