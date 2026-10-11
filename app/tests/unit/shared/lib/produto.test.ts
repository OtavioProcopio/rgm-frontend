import { describe, expect, it } from 'vitest';

import { NOME_DO_PRODUTO } from '@/shared/lib/produto';

describe('NOME_DO_PRODUTO', () => {
  it('deve ser Rei Auto Parts quando o produto é identificado ao usuário', () => {
    // Assert
    expect(NOME_DO_PRODUTO).toBe('Rei Auto Parts');
  });
});
