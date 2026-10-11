import { describe, expect, it } from 'vitest';

import { OPCOES_DE_TEMA } from '@/shared/components/ThemeToggle/opcoesDeTema';

describe('OPCOES_DE_TEMA', () => {
  it('deve listar Sistema, Claro e Escuro nessa ordem quando consultada', () => {
    // Act
    const rotulos = OPCOES_DE_TEMA.map((opcao) => opcao.rotulo);

    // Assert
    expect(rotulos).toEqual(['Sistema', 'Claro', 'Escuro']);
  });

  it('deve ligar cada rótulo a uma preferência de tema diferente quando consultada', () => {
    // Act
    const preferencias = OPCOES_DE_TEMA.map((opcao) => opcao.preferencia);

    // Assert
    expect(preferencias).toEqual(['system', 'light', 'dark']);
  });

  it('deve dar um ícone a cada opção quando consultada', () => {
    // Act
    const semIcone = OPCOES_DE_TEMA.filter((opcao) => !opcao.Icone);

    // Assert
    expect(semIcone).toEqual([]);
  });
});
