import { z } from 'zod';

export const maquinaSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  codigo: z.string().min(1, 'Código é obrigatório.'),
  descricao: z.string().optional(),
});

export type MaquinaFormData = z.infer<typeof maquinaSchema>;
