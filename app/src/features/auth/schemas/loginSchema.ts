import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
