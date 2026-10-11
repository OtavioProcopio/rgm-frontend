import { describe, expect, it } from 'vitest';

import { PERIODOS, intervalosDoPeriodo } from '@/features/solicitacoes/lib/periodoDoPainel';
import { DIA_MS } from '@/shared/lib/duracao';

const dias = (intervalo: { inicio: string; fim: string }): number =>
  (Date.parse(intervalo.fim) - Date.parse(intervalo.inicio)) / DIA_MS;

describe('PERIODOS', () => {
  it('deve listar 7, 30 e 90 dias quando os períodos do painel são consultados', () => {
    // Arrange
    const esperado = [7, 30, 90];

    // Act
    const periodos = [...PERIODOS];

    // Assert
    expect(periodos).toEqual(esperado);
  });
});

describe('intervalosDoPeriodo', () => {
  const agora = new Date('2026-10-09T15:30:00Z');

  it.each([7, 30, 90])('deve devolver o atual com %i dias quando o período é de %i dias', (n) => {
    // Arrange
    const periodo = n;

    // Act
    const { atual } = intervalosDoPeriodo(periodo, agora);

    // Assert
    expect(dias(atual)).toBe(periodo);
  });

  it.each([7, 30, 90])(
    'deve devolver o anterior com %i dias quando o período é de %i dias',
    (n) => {
      // Arrange
      const periodo = n;

      // Act
      const { anterior } = intervalosDoPeriodo(periodo, agora);

      // Assert
      expect(dias(anterior)).toBe(periodo);
    },
  );

  it.each([7, 30, 90])(
    'deve terminar o anterior onde o atual começa quando o período é %i',
    (n) => {
      // Arrange
      const periodo = n;

      // Act
      const { atual, anterior } = intervalosDoPeriodo(periodo, agora);

      // Assert
      expect(anterior.fim).toBe(atual.inicio);
    },
  );

  it('deve incluir o dia de hoje inteiro quando calcula o intervalo atual', () => {
    // Arrange
    const periodo = 7;

    // Act
    const { atual } = intervalosDoPeriodo(periodo, agora);

    // Assert
    expect(atual).toEqual({
      inicio: '2026-10-03T00:00:00.000Z',
      fim: '2026-10-10T00:00:00.000Z',
    });
  });

  it('deve devolver o mesmo resultado quando dois instantes caem no mesmo dia UTC', () => {
    // Arrange
    const cedo = new Date('2026-10-09T00:00:00Z');
    const tarde = new Date('2026-10-09T23:59:59Z');

    // Act
    const resultadoCedo = intervalosDoPeriodo(30, cedo);
    const resultadoTarde = intervalosDoPeriodo(30, tarde);

    // Assert
    expect(resultadoTarde).toEqual(resultadoCedo);
  });

  it('deve devolver resultados diferentes quando o instante cruza a meia-noite UTC', () => {
    // Arrange
    const antes = new Date('2026-10-09T23:59:59Z');
    const depois = new Date('2026-10-10T00:00:00Z');

    // Act
    const resultadoAntes = intervalosDoPeriodo(30, antes);
    const resultadoDepois = intervalosDoPeriodo(30, depois);

    // Assert
    expect(resultadoDepois).not.toEqual(resultadoAntes);
  });

  it('deve devolver datas ISO à meia-noite UTC quando o instante tem hora e milissegundos', () => {
    // Arrange
    const instante = new Date('2026-10-09T15:30:45.123Z');

    // Act
    const { atual, anterior } = intervalosDoPeriodo(7, instante);

    // Assert
    const datas = [atual.inicio, atual.fim, anterior.inicio, anterior.fim];
    expect(datas.every((data) => data.endsWith('T00:00:00.000Z'))).toBe(true);
  });
});
