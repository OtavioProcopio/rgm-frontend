import { z } from 'zod';

export const maquinaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório.'),
});

export type MaquinaFormData = z.infer<typeof maquinaSchema>;
