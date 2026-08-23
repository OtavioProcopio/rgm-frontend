import { z } from 'zod';

export const abrirSolicitacaoSchema = z
  .object({
    titulo: z.string().min(1, 'Título obrigatório'),
    descricao: z.string().min(1, 'Descrição obrigatória'),
    tipo: z.enum(['REPARO', 'INSPECAO', 'REENGENHARIA', 'CRIACAO']),
    modeloId: z.string().optional(),
    modeloCodigo: z.string().optional(),
    modeloMaquina: z.string().optional(),
    modeloObservacoes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === 'CRIACAO') {
      if (!data.modeloCodigo?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['modeloCodigo'],
          message: 'Código do modelo obrigatório',
        });
      }
      if (!data.modeloMaquina?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['modeloMaquina'],
          message: 'Selecione uma máquina',
        });
      }
    } else if (!data.modeloId?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['modeloId'], message: 'Selecione um modelo' });
    }
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
  motivo: z.string().min(1, 'Motivo obrigatório'),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
});

export const comentarioSchema = z.object({
  comentario: z.string().min(1, 'Comentário obrigatório'),
});

export const enviarParaValidacaoSchema = z.object({
  comentario: z
    .string()
    .min(10, 'Descreva o serviço realizado (mínimo 10 caracteres)')
    .max(1000, 'Máximo 1000 caracteres'),
});

export type AbrirSolicitacaoFormData = z.infer<typeof abrirSolicitacaoSchema>;
export type TriarSolicitacaoFormData = z.infer<typeof triarSolicitacaoSchema>;
export type EncerrarSolicitacaoFormData = z.infer<typeof encerrarSolicitacaoSchema>;
export type DevolverSolicitacaoFormData = z.infer<typeof devolverSolicitacaoSchema>;
export type ComentarioFormData = z.infer<typeof comentarioSchema>;
export type EnviarParaValidacaoFormData = z.infer<typeof enviarParaValidacaoSchema>;
