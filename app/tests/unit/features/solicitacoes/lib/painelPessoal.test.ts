import { describe, expect, it } from 'vitest';

import { painelPessoalVazio } from '@/features/solicitacoes/lib/painelPessoal';

describe('painelPessoalVazio', () => {
  it('deve dizer que está vazio quando todas as contagens são zero ou ausentes', () => {
    // Arrange
    const contagens = [0, undefined, 0] as const;

    // Act
    const vazio = painelPessoalVazio(...contagens);

    // Assert
    expect(vazio).toBe(true);
  });

  it('deve dizer que não está vazio quando há ao menos uma concluída', () => {
    // Arrange
    const contagens = [0, 0, 3] as const;

    // Act
    const vazio = painelPessoalVazio(...contagens);

    // Assert
    expect(vazio).toBe(false);
  });
});
