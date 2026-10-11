/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

import { agruparPorDia, LIMITE_VISIVEL, recolherGrupos } from '@/shared/lib/linhaDoTempo';
import type { GrupoDoDia } from '@/shared/lib/linhaDoTempo';

type Item = { em: string; id: string };

const AGORA = new Date(2026, 9, 8, 15, 0).getTime();

function item(id: string, ano: number, mes: number, dia: number, hora: number, min: number): Item {
  return { id, em: new Date(ano, mes, dia, hora, min).toISOString() };
}

function grupo(chave: string, quantidade: number): GrupoDoDia<number> {
  const itens: number[] = Array.from({ length: quantidade }, (_: unknown, i: number) => i);
  return { chave, rotulo: chave, itens };
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

describe('recolherGrupos', () => {
  it('deve deixar 10 itens visíveis quando há 11 itens em 2 dias', () => {
    // Arrange
    const grupos = [grupo('recente', 6), grupo('antigo', 5)];

    // Act
    const resultado = recolherGrupos(grupos, false);

    // Assert
    expect(resultado.grupos.map((g) => g.itens.length)).toEqual([6, 4]);
  });

  it('deve informar 1 item oculto quando há 11 itens em 2 dias', () => {
    // Arrange
    const grupos = [grupo('recente', 6), grupo('antigo', 5)];

    // Act
    const resultado = recolherGrupos(grupos, false);

    // Assert
    expect(resultado.ocultos).toBe(1);
  });

  it('deve descartar o grupo mais antigo quando todos os seus itens ficam ocultos', () => {
    // Arrange
    const grupos = [grupo('recente', 10), grupo('antigo', 2)];

    // Act
    const resultado = recolherGrupos(grupos, false);

    // Assert
    expect(resultado.grupos.map((g) => g.chave)).toEqual(['recente']);
  });

  it('deve informar os itens do grupo descartado como ocultos quando o grupo some', () => {
    // Arrange
    const grupos = [grupo('recente', 10), grupo('antigo', 2)];

    // Act
    const resultado = recolherGrupos(grupos, false);

    // Assert
    expect(resultado.ocultos).toBe(2);
  });

  it('deve devolver tudo quando há exatamente 10 itens', () => {
    // Arrange
    const grupos = [grupo('recente', 4), grupo('antigo', LIMITE_VISIVEL - 4)];

    // Act
    const resultado = recolherGrupos(grupos, false);

    // Assert
    expect(resultado).toEqual({ grupos, ocultos: 0 });
  });

  it('deve devolver tudo quando está expandido', () => {
    // Arrange
    const grupos = [grupo('recente', 12), grupo('antigo', 13)];

    // Act
    const resultado = recolherGrupos(grupos, true);

    // Assert
    expect(resultado).toEqual({ grupos, ocultos: 0 });
  });

  it('deve respeitar o limite informado quando é personalizado', () => {
    // Arrange
    const grupos = [grupo('recente', 4), grupo('antigo', 4)];

    // Act
    const resultado = recolherGrupos(grupos, false, 5);

    // Assert
    expect(resultado.ocultos).toBe(3);
  });

  it('deve preservar os grupos recebidos quando recolhe', () => {
    // Arrange
    const grupos = [grupo('recente', 8), grupo('antigo', 8)];
    const copia = structuredClone(grupos);

    // Act
    recolherGrupos(grupos, false);

    // Assert
    expect(grupos).toEqual(copia);
  });

  it('deve retornar lista vazia e nenhum oculto quando não há grupos', () => {
    // Arrange
    const grupos: GrupoDoDia<number>[] = [];

    // Act
    const resultado = recolherGrupos(grupos, false);

    // Assert
    expect(resultado).toEqual({ grupos: [], ocultos: 0 });
  });
});
