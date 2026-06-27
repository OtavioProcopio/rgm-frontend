import { z } from 'zod';

export const abrirSolicitacaoSchema = z.object({
  titulo: z.string().min(1, 'Título obrigatório'),
  descricao: z.string().min(1, 'Descrição obrigatória'),
  tipo: z.enum(['REPARO', 'INSPECAO', 'REENGENHARIA']),
  modeloId: z.string().min(1, 'Selecione um modelo'),
});

export const triarSolicitacaoSchema = z.object({
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']),
  responsavelIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos um responsável'),
});

export const encerrarSolicitacaoSchema = z.object({
  concluir: z.boolean(),
  comentario: z.string().min(1, 'Comentário obrigatório'),
});

export const devolverSolicitacaoSchema = z.object({
  motivo: z.string().optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
});

export const comentarioSchema = z.object({
  comentario: z.string().min(1, 'Comentário obrigatório'),
});

export type AbrirSolicitacaoFormData = z.infer<typeof abrirSolicitacaoSchema>;
export type TriarSolicitacaoFormData = z.infer<typeof triarSolicitacaoSchema>;
export type EncerrarSolicitacaoFormData = z.infer<typeof encerrarSolicitacaoSchema>;
export type DevolverSolicitacaoFormData = z.infer<typeof devolverSolicitacaoSchema>;
export type ComentarioFormData = z.infer<typeof comentarioSchema>;
