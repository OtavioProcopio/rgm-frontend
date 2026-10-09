import { describe, expect, it } from 'vitest';

import { formatarDuracao } from '@/shared/lib/duracao';

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

describe('formatarDuracao', () => {
  it('deve escrever 1 min quando a duração é menor que 1 minuto', () => {
    // Arrange
    const ms = 20_000;

    // Act
    const resultado = formatarDuracao(ms);

    // Assert
    expect(resultado).toBe('1 min');
  });

  it('deve escrever em minutos quando a duração é de 59 minutos', () => {
    // Arrange
    const ms = 59 * MINUTO;

    // Act
    const resultado = formatarDuracao(ms);

    // Assert
    expect(resultado).toBe('59 min');
  });

  it('deve escrever em horas quando a duração é de 60 minutos', () => {
    // Arrange
    const ms = 60 * MINUTO;

    // Act
    const resultado = formatarDuracao(ms);

    // Assert
    expect(resultado).toBe('1 h');
  });

  it('deve escrever em horas quando a duração é de 47 horas', () => {
    // Arrange
    const ms = 47 * HORA;

    // Act
    const resultado = formatarDuracao(ms);

    // Assert
    expect(resultado).toBe('47 h');
  });

  it('deve escrever em dias quando a duração é de 48 horas', () => {
    // Arrange
    const ms = 48 * HORA;

    // Act
    const resultado = formatarDuracao(ms);

    // Assert
    expect(resultado).toBe('2 d');
  });

  it('deve escrever em dias quando a duração é de muitos dias', () => {
    // Arrange
    const ms = 30 * DIA;

    // Act
    const resultado = formatarDuracao(ms);

    // Assert
    expect(resultado).toBe('30 d');
  });
});
