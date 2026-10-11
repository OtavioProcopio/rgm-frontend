import { describe, expect, it } from 'vitest';

import { temFiltroAtivo } from '@/features/solicitacoes/lib/temFiltroAtivo';

describe('temFiltroAtivo', () => {
  it('deve dizer que não há filtro quando só a paginação está preenchida', () => {
    // Arrange
    const filtros = { page: 0, size: 20 };

    // Act
    const resultado = temFiltroAtivo(filtros);

    // Assert
    expect(resultado).toBe(false);
  });

  it('deve dizer que há filtro quando algum campo além da paginação tem valor', () => {
    // Arrange
    const filtros = { page: 0, size: 20, maquina: 'FBOX' };

    // Act
    const resultado = temFiltroAtivo(filtros);

    // Assert
    expect(resultado).toBe(true);
  });

  it('deve ignorar campo vazio quando o filtro foi limpo', () => {
    // Arrange
    const filtros = { page: 1, size: 20, maquina: '' };

    // Act
    const resultado = temFiltroAtivo(filtros);

    // Assert
    expect(resultado).toBe(false);
  });
});
