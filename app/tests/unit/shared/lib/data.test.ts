/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

import { chaveDoDia, formatarDataHora, rotuloDoDia, tempoRelativo } from '@/shared/lib/data';

const SEGUNDO = 1000;
const MINUTO = 60 * SEGUNDO;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

const AGORA = new Date(2026, 9, 8, 15, 0).getTime();

function isoAntes(deslocamentoMs: number): string {
  return new Date(AGORA - deslocamentoMs).toISOString();
}

function isoLocal(ano: number, mes: number, dia: number, hora: number, min: number): string {
  return new Date(ano, mes, dia, hora, min).toISOString();
}

describe('tempoRelativo', () => {
  it('deve retornar "agora" quando passaram 30 segundos', () => {
    // Arrange
    const iso = isoAntes(30 * SEGUNDO);

    // Act
    const resultado = tempoRelativo(iso, AGORA);

    // Assert
    expect(resultado).toBe('agora');
  });

  it('deve retornar "há 1 min" quando passou exatamente 1 minuto', () => {
    // Arrange
    const iso = isoAntes(MINUTO);

    // Act
    const resultado = tempoRelativo(iso, AGORA);

    // Assert
    expect(resultado).toBe('há 1 min');
  });

  it('deve retornar "há 59 min" quando passaram 59 minutos', () => {
    // Arrange
    const iso = isoAntes(59 * MINUTO);

    // Act
    const resultado = tempoRelativo(iso, AGORA);

    // Assert
    expect(resultado).toBe('há 59 min');
  });

  it('deve retornar "há 1 h" quando passaram 60 minutos', () => {
    // Arrange
    const iso = isoAntes(60 * MINUTO);

    // Act
    const resultado = tempoRelativo(iso, AGORA);

    // Assert
    expect(resultado).toBe('há 1 h');
  });

  it('deve retornar "há 47 h" quando passaram 47 horas', () => {
    // Arrange
    const iso = isoAntes(47 * HORA);

    // Act
    const resultado = tempoRelativo(iso, AGORA);

    // Assert
    expect(resultado).toBe('há 47 h');
  });

  it('deve retornar "há 2 d" quando passaram 48 horas', () => {
    // Arrange
    const iso = isoAntes(48 * HORA);

    // Act
    const resultado = tempoRelativo(iso, AGORA);

    // Assert
    expect(resultado).toBe('há 2 d');
  });

  it('deve retornar "há 10 d" quando passaram 10 dias', () => {
    // Arrange
    const iso = isoAntes(10 * DIA);

    // Act
    const resultado = tempoRelativo(iso, AGORA);

    // Assert
    expect(resultado).toBe('há 10 d');
  });

  it('deve retornar "agora" quando o instante está no futuro', () => {
    // Arrange
    const iso = new Date(AGORA + 5 * MINUTO).toISOString();

    // Act
    const resultado = tempoRelativo(iso, AGORA);

    // Assert
    expect(resultado).toBe('agora');
  });
});

describe('formatarDataHora', () => {
  it('deve formatar dia, mês, ano e hora sem segundos quando recebe um instante', () => {
    // Arrange
    const iso = new Date(2026, 9, 8, 15, 7, 45).toISOString();

    // Act
    const resultado = formatarDataHora(iso);

    // Assert
    expect(resultado).toMatch(/^08\/10\/2026.*15:07$/);
  });
});

describe('chaveDoDia', () => {
  it('deve retornar AAAA-MM-DD no fuso local quando recebe um instante', () => {
    // Arrange
    const iso = isoLocal(2026, 0, 5, 23, 30);

    // Act
    const resultado = chaveDoDia(iso);

    // Assert
    expect(resultado).toBe('2026-01-05');
  });
});

describe('rotuloDoDia', () => {
  it('deve retornar "Hoje" quando o instante é do mesmo dia local', () => {
    // Arrange
    const iso = isoLocal(2026, 9, 8, 9, 0);

    // Act
    const resultado = rotuloDoDia(iso, AGORA);

    // Assert
    expect(resultado).toBe('Hoje');
  });

  it('deve retornar "Ontem" quando o instante é do dia anterior', () => {
    // Arrange
    const iso = isoLocal(2026, 9, 7, 12, 0);

    // Act
    const resultado = rotuloDoDia(iso, AGORA);

    // Assert
    expect(resultado).toBe('Ontem');
  });

  it('deve retornar a data dd/mm/aaaa quando o instante é anterior a ontem', () => {
    // Arrange
    const iso = isoLocal(2026, 9, 6, 12, 0);

    // Act
    const resultado = rotuloDoDia(iso, AGORA);

    // Assert
    expect(resultado).toBe('06/10/2026');
  });

  it('deve retornar "Ontem" quando o instante é 23:59 de ontem', () => {
    // Arrange
    const iso = isoLocal(2026, 9, 7, 23, 59);
    const agora = new Date(2026, 9, 8, 0, 1).getTime();

    // Act
    const resultado = rotuloDoDia(iso, agora);

    // Assert
    expect(resultado).toBe('Ontem');
  });

  it('deve retornar "Hoje" quando o instante é 00:01 de hoje', () => {
    // Arrange
    const iso = isoLocal(2026, 9, 8, 0, 1);
    const agora = new Date(2026, 9, 8, 0, 2).getTime();

    // Act
    const resultado = rotuloDoDia(iso, agora);

    // Assert
    expect(resultado).toBe('Hoje');
  });
});
