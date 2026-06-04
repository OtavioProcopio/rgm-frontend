import { describe, expect, it } from 'vitest';

import { criarModeloSchema, editarModeloSchema } from './modeloSchema';

describe('modeloSchema', () => {
  it('requires machine on create', () => {
    const result = criarModeloSchema.safeParse({ codigo: 'M-01', descricao: 'Modelo base' });

    expect(result.success).toBe(false);
  });

  it('does not require machine on edit', () => {
    const result = editarModeloSchema.safeParse({ codigo: 'M-01', descricao: 'Modelo base' });

    expect(result.success).toBe(true);
  });
});
