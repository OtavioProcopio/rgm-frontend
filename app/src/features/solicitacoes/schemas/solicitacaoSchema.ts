import { z } from 'zod';

import { LIMITES, mensagemDeLimite } from '@/shared/lib/limites';

function textoLimitado(limite: number) {
  return z.string().max(limite, mensagemDeLimite(limite));
}

export const abrirSolicitacaoSchema = z
  .object({
    titulo: textoLimitado(LIMITES.solicitacaoTitulo).min(1, 'Título obrigatório'),
    descricao: textoLimitado(LIMITES.textoLongo).min(1, 'Descrição obrigatória'),
    tipo: z.enum(['REPARO', 'INSPECAO', 'REENGENHARIA', 'CRIACAO']),
    modeloId: z.string().optional(),
    modeloCodigo: textoLimitado(LIMITES.modeloPretendidoCodigo).optional(),
    modeloMaquina: textoLimitado(LIMITES.modeloPretendidoMaquina).optional(),
    modeloObservacoes: textoLimitado(LIMITES.textoLongo).optional(),
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
  comentario: textoLimitado(LIMITES.textoLongo).min(1, 'Comentário obrigatório'),
});

export const devolverSolicitacaoSchema = z.object({
  motivo: textoLimitado(LIMITES.textoLongo).min(1, 'Motivo obrigatório'),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
});

export const comentarioSchema = z.object({
  comentario: textoLimitado(LIMITES.textoLongo).min(1, 'Comentário obrigatório'),
});

export const enviarParaValidacaoSchema = z.object({
  comentario: z
    .string()
    .min(10, 'Descreva o serviço realizado (mínimo 10 caracteres)')
    .max(LIMITES.comentarioValidacao, mensagemDeLimite(LIMITES.comentarioValidacao)),
});

export const editarSolicitacaoSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, 'Título obrigatório')
    .max(LIMITES.solicitacaoTitulo, mensagemDeLimite(LIMITES.solicitacaoTitulo)),
  descricao: z
    .string()
    .trim()
    .min(1, 'Descrição obrigatória')
    .max(LIMITES.textoLongo, mensagemDeLimite(LIMITES.textoLongo)),
});

export type AbrirSolicitacaoFormData = z.infer<typeof abrirSolicitacaoSchema>;
export type TriarSolicitacaoFormData = z.infer<typeof triarSolicitacaoSchema>;
export type EncerrarSolicitacaoFormData = z.infer<typeof encerrarSolicitacaoSchema>;
export type DevolverSolicitacaoFormData = z.infer<typeof devolverSolicitacaoSchema>;
export type ComentarioFormData = z.infer<typeof comentarioSchema>;
export type EnviarParaValidacaoFormData = z.infer<typeof enviarParaValidacaoSchema>;
export type EditarSolicitacaoFormData = z.infer<typeof editarSolicitacaoSchema>;
