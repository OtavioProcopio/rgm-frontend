import { describe, expect, it } from 'vitest';

import { maquinaSchema } from './maquinaSchema';

describe('maquinaSchema', () => {
  it('requires name and code', () => {
    const result = maquinaSchema.safeParse({ nome: 'A', codigo: '' });

    expect(result.success).toBe(false);
  });

  it('accepts valid data', () => {
    const result = maquinaSchema.safeParse({ nome: 'Corte Laser', codigo: 'CL-01' });

    expect(result.success).toBe(true);
  });
});
