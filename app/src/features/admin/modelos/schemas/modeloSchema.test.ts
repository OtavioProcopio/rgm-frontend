import { describe, expect, it } from 'vitest';

import { criarModeloSchema, editarModeloSchema } from './modeloSchema';

describe('modeloSchema', () => {
  it('requires machine on create', () => {
    const result = criarModeloSchema.safeParse({ codigo: 'M-01', descricao: 'Modelo base' });

    expect(result.success).toBe(false);
  });

  it('requires machine on edit', () => {
    const result = editarModeloSchema.safeParse({ codigo: 'M-01', descricao: 'Modelo base' });

    expect(result.success).toBe(false);
  });

  it('succeeds on edit with valid data', () => {
    const result = editarModeloSchema.safeParse({
      codigo: 'M-01',
      descricao: 'Modelo base',
      maquina: 'FBOX',
    });

    expect(result.success).toBe(true);
  });
});
