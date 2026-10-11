import { describe, expect, it } from 'vitest';

import { loginSchema } from '@/features/auth/schemas/loginSchema';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@rgm.com',
      senha: 'admin123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid credentials shape', () => {
    const result = loginSchema.safeParse({
      email: 'email-invalido',
      senha: '',
    });

    expect(result.success).toBe(false);
  });
});
