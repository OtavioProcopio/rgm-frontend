import { z } from 'zod';

export const criarModeloSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório.'),
  descricao: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres.'),
  observacoes: z.string().optional(),
  maquinaId: z.string().min(1, 'Máquina é obrigatória.'),
});

export const editarModeloSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório.'),
  descricao: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres.'),
  observacoes: z.string().optional(),
});

export type CriarModeloFormData = z.infer<typeof criarModeloSchema>;
export type EditarModeloFormData = z.infer<typeof editarModeloSchema>;
