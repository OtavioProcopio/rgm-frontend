import { describe, expect, it } from 'vitest';

import { maquinaSchema } from '@/features/admin/maquinas/schemas/maquinaSchema';

describe('maquinaSchema', () => {
  it('requires nome', () => {
    const result = maquinaSchema.safeParse({ nome: '' });
    expect(result.success).toBe(false);
  });

  it('succeeds with a valid nome', () => {
    const result = maquinaSchema.safeParse({ nome: 'FBOX' });
    expect(result.success).toBe(true);
  });
});
