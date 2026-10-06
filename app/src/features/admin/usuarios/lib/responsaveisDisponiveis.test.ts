import { describe, expect, it } from 'vitest';

import type { PerfilUsuario, Usuario } from '../types/usuarioTypes';
import { filtrarResponsaveisDisponiveis } from './responsaveisDisponiveis';

function usuario(id: string, perfil: PerfilUsuario, ativo = true): Usuario {
  return { id, nome: id, email: null, perfil, ativo, criadoEm: '', atualizadoEm: '' };
}

describe('filtrarResponsaveisDisponiveis', () => {
  it('deve manter operador e gestor quando estão ativos', () => {
    // Arrange
    const operador = usuario('op', 'OPERADOR');
    const gestor = usuario('ge', 'GESTOR');

    // Act
    const resultado = filtrarResponsaveisDisponiveis([operador, gestor]);

    // Assert
    expect(resultado).toEqual([operador, gestor]);
  });

  it('deve remover administrador e externo quando presentes na lista', () => {
    // Arrange
    const usuarios = [usuario('ad', 'ADMINISTRADOR'), usuario('ex', 'EXTERNO')];

    // Act
    const resultado = filtrarResponsaveisDisponiveis(usuarios);

    // Assert
    expect(resultado).toEqual([]);
  });

  it('deve remover operador quando está inativo', () => {
    // Arrange
    const usuarios = [usuario('op', 'OPERADOR', false)];

    // Act
    const resultado = filtrarResponsaveisDisponiveis(usuarios);

    // Assert
    expect(resultado).toEqual([]);
  });
});
