import { describe, expect, it } from 'vitest';

import { posicaoNoCatalogo } from '@/features/modelos/lib/posicaoNoCatalogo';

const m = (id: string) => ({ id });
const BLOCO = [m('a'), m('b'), m('c')];

describe('posicaoNoCatalogo', () => {
  it('deve dar a posição, o anterior e o próximo de um modelo do meio', () => {
    // Act
    const posicao = posicaoNoCatalogo(BLOCO, 'b', 0, 3, 3);

    // Assert
    expect(posicao).toEqual({
      numero: 2,
      anterior: m('a'),
      proximo: m('c'),
      faltaCarregarAntes: false,
      faltaCarregarDepois: false,
    });
  });

  it('não deve ter anterior no primeiro do filtro nem pedir bloco antes', () => {
    const posicao = posicaoNoCatalogo(BLOCO, 'a', 0, 3, 3)!;

    expect(posicao.anterior).toBeNull();
    expect(posicao.faltaCarregarAntes).toBe(false);
  });

  it('não deve ter próximo no último do filtro nem pedir bloco depois', () => {
    const posicao = posicaoNoCatalogo(BLOCO, 'c', 0, 3, 3)!;

    expect(posicao.proximo).toBeNull();
    expect(posicao.faltaCarregarDepois).toBe(false);
  });

  it('deve pedir o próximo bloco no último carregado quando o servidor tem mais', () => {
    const posicao = posicaoNoCatalogo(BLOCO, 'c', 0, 3, 7)!;

    expect(posicao.proximo).toBeNull();
    expect(posicao.faltaCarregarDepois).toBe(true);
  });

  it('deve contar a posição pelo bloco em que a lista começou e pedir o bloco anterior', () => {
    // Arrange: a lista abriu no bloco 6 (a partir de 0) de 20 por bloco
    const posicao = posicaoNoCatalogo(BLOCO, 'a', 6, 20, 300)!;

    // Assert
    expect(posicao.numero).toBe(121);
    expect(posicao.anterior).toBeNull();
    expect(posicao.faltaCarregarAntes).toBe(true);
  });

  it('deve devolver nulo quando o modelo não está carregado', () => {
    expect(posicaoNoCatalogo(BLOCO, 'x', 0, 3, 3)).toBeNull();
    expect(posicaoNoCatalogo([], 'a', 0, 3, 0)).toBeNull();
  });
});
