/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { gravarPreferencia, lerPreferencia } from '@/shared/lib/preferenciaDeInterface';

const CHAVE = 'rgm.menu.recolhido';
const PADRAO = 'aberto';

function limpar() {
  localStorage.clear();
  vi.restoreAllMocks();
}

beforeEach(limpar);
afterEach(limpar);

describe('lerPreferencia', () => {
  it('deve devolver o valor guardado quando a chave existe', () => {
    // Arrange
    localStorage.setItem(CHAVE, 'recolhido');

    // Act
    const valor = lerPreferencia(CHAVE, PADRAO);

    // Assert
    expect(valor).toBe('recolhido');
  });

  it('deve devolver o padrão quando a chave não existe', () => {
    // Act
    const valor = lerPreferencia(CHAVE, PADRAO);

    // Assert
    expect(valor).toBe(PADRAO);
  });

  it('deve devolver o padrão quando getItem lança', () => {
    // Arrange
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('acesso negado');
    });

    // Act
    const valor = lerPreferencia(CHAVE, PADRAO);

    // Assert
    expect(valor).toBe(PADRAO);
    expect(getItem).toHaveBeenCalledTimes(1);
    expect(getItem).toHaveBeenCalledWith(CHAVE);
  });
});

describe('gravarPreferencia', () => {
  it('deve devolver o valor gravado quando a preferência é lida de volta', () => {
    // Arrange
    gravarPreferencia(CHAVE, 'recolhido');

    // Act
    const valor = lerPreferencia(CHAVE, PADRAO);

    // Assert
    expect(valor).toBe('recolhido');
  });

  it('deve não lançar quando setItem lança', () => {
    // Arrange
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('navegação privada');
    });

    // Act
    const gravar = () => gravarPreferencia(CHAVE, 'recolhido');

    // Assert
    expect(gravar).not.toThrow();
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(setItem).toHaveBeenCalledWith(CHAVE, 'recolhido');
  });
});
