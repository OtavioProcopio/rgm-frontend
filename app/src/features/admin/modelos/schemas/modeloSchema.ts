import { z } from 'zod';

export const criarModeloSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório.'),
  descricao: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres.'),
  observacoes: z.string().optional(),
  maquina: z.string().min(1, 'Máquina/Encaixe é obrigatório.'),
});

export const editarModeloSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório.'),
  descricao: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres.'),
  observacoes: z.string().optional(),
  maquina: z.string().min(1, 'Máquina/Encaixe é obrigatório.'),
});

export type CriarModeloFormData = z.infer<typeof criarModeloSchema>;
export type EditarModeloFormData = z.infer<typeof editarModeloSchema>;
