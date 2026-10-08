import { describe, expect, it } from 'vitest';

import { resumoDeFiltros } from '@/shared/lib/resumoDeFiltros';

describe('resumoDeFiltros', () => {
  it('deve devolver apenas "Filtros" quando não há filtros ativos', () => {
    // Arrange
    const quantidade: number = 0;

    // Act
    const resumo: string = resumoDeFiltros(quantidade);

    // Assert
    expect(resumo).toBe('Filtros');
  });

  it('deve usar o singular quando há um filtro ativo', () => {
    // Arrange
    const quantidade: number = 1;

    // Act
    const resumo: string = resumoDeFiltros(quantidade);

    // Assert
    expect(resumo).toBe('Filtros · 1 ativo');
  });

  it('deve usar o plural quando há dois filtros ativos', () => {
    // Arrange
    const quantidade: number = 2;

    // Act
    const resumo: string = resumoDeFiltros(quantidade);

    // Assert
    expect(resumo).toBe('Filtros · 2 ativos');
  });

  it('deve usar o plural quando há muitos filtros ativos', () => {
    // Arrange
    const quantidade: number = 12;

    // Act
    const resumo: string = resumoDeFiltros(quantidade);

    // Assert
    expect(resumo).toBe('Filtros · 12 ativos');
  });

  it('deve devolver apenas "Filtros" quando a quantidade é negativa', () => {
    // Arrange
    const quantidade: number = -3;

    // Act
    const resumo: string = resumoDeFiltros(quantidade);

    // Assert
    expect(resumo).toBe('Filtros');
  });
});
