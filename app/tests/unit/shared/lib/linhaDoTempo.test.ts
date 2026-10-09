/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

import { agruparPorDia, LIMITE_VISIVEL, recolher } from '@/shared/lib/linhaDoTempo';

type Item = { em: string; id: string };

const AGORA = new Date(2026, 9, 8, 15, 0).getTime();

function item(id: string, ano: number, mes: number, dia: number, hora: number, min: number): Item {
  return { id, em: new Date(ano, mes, dia, hora, min).toISOString() };
}

function numeros(quantidade: number): number[] {
  return Array.from({ length: quantidade }, (_: unknown, indice: number) => indice + 1);
}

describe('agruparPorDia', () => {
  it('deve ordenar do mais recente ao mais antigo quando os itens chegam fora de ordem', () => {
    // Arrange
    const itens = [
      item('a', 2026, 9, 6, 10, 0),
      item('c', 2026, 9, 8, 10, 0),
      item('b', 2026, 9, 7, 10, 0),
    ];

    // Act
    const grupos = agruparPorDia(itens, AGORA);

    // Assert
    expect(grupos.map((grupo) => grupo.itens[0].id)).toEqual(['c', 'b', 'a']);
  });

  it('deve ordenar do mais recente ao mais antigo quando os itens são do mesmo dia', () => {
    // Arrange
    const itens = [
      item('manha', 2026, 9, 8, 8, 0),
      item('tarde', 2026, 9, 8, 14, 0),
      item('meio', 2026, 9, 8, 12, 0),
    ];

    // Act
    const grupos = agruparPorDia(itens, AGORA);

    // Assert
    expect(grupos[0].itens.map((valor) => valor.id)).toEqual(['tarde', 'meio', 'manha']);
  });

  it('deve manter a ordem de chegada quando os itens estão no mesmo instante', () => {
    // Arrange
    const itens = [
      item('x', 2026, 9, 8, 9, 0),
      item('y', 2026, 9, 8, 9, 0),
      item('z', 2026, 9, 8, 9, 0),
    ];

    // Act
    const grupos = agruparPorDia(itens, AGORA);

    // Assert
    expect(grupos[0].itens.map((valor) => valor.id)).toEqual(['x', 'y', 'z']);
  });

  it('deve agrupar em Hoje, Ontem e a data quando os itens são de três dias', () => {
    // Arrange
    const itens = [
      item('a', 2026, 9, 8, 9, 0),
      item('b', 2026, 9, 7, 9, 0),
      item('c', 2026, 9, 6, 9, 0),
    ];

    // Act
    const grupos = agruparPorDia(itens, AGORA);

    // Assert
    expect(grupos.map((grupo) => grupo.rotulo)).toEqual(['Hoje', 'Ontem', '06/10/2026']);
    expect(grupos.map((grupo) => grupo.chave)).toEqual(['2026-10-08', '2026-10-07', '2026-10-06']);
  });

  it('deve retornar lista vazia quando não há itens', () => {
    // Arrange
    const itens: Item[] = [];

    // Act
    const grupos = agruparPorDia(itens, AGORA);

    // Assert
    expect(grupos).toEqual([]);
  });

  it('deve preservar o array recebido quando agrupa', () => {
    // Arrange
    const itens = [item('a', 2026, 9, 6, 9, 0), item('b', 2026, 9, 8, 9, 0)];
    const copia = [...itens];

    // Act
    agruparPorDia(itens, AGORA);

    // Assert
    expect(itens).toEqual(copia);
  });
});

describe('recolher', () => {
  it('deve deixar 10 visíveis e 1 oculto quando há 11 itens recolhidos', () => {
    // Arrange
    const itens = numeros(11);

    // Act
    const resultado = recolher(itens, false);

    // Assert
    expect(resultado.visiveis).toEqual(numeros(10));
    expect(resultado.ocultos).toBe(1);
  });

  it('deve mostrar todos quando há exatamente 10 itens', () => {
    // Arrange
    const itens = numeros(LIMITE_VISIVEL);

    // Act
    const resultado = recolher(itens, false);

    // Assert
    expect(resultado).toEqual({ visiveis: itens, ocultos: 0 });
  });

  it('deve mostrar todos quando há 3 itens', () => {
    // Arrange
    const itens = numeros(3);

    // Act
    const resultado = recolher(itens, false);

    // Assert
    expect(resultado).toEqual({ visiveis: itens, ocultos: 0 });
  });

  it('deve mostrar todos quando está expandido', () => {
    // Arrange
    const itens = numeros(25);

    // Act
    const resultado = recolher(itens, true);

    // Assert
    expect(resultado).toEqual({ visiveis: itens, ocultos: 0 });
  });

  it('deve respeitar o limite informado quando é personalizado', () => {
    // Arrange
    const itens = numeros(8);

    // Act
    const resultado = recolher(itens, false, 5);

    // Assert
    expect(resultado).toEqual({ visiveis: numeros(5), ocultos: 3 });
  });
});
