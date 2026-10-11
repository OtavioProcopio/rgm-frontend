import { z } from 'zod';

import { LIMITES, mensagemDeLimite } from '@/shared/lib/limites';

/** O tipo vem do catálogo; a API recusa o que não estiver nele ou estiver inativo. */
const tipoModeloSchema = z.string().min(1).max(LIMITES.tipoModeloNome);

export const criarModeloSchema = z.object({
  codigo: z
    .string()
    .min(1, 'Código é obrigatório.')
    .max(LIMITES.modeloCodigo, mensagemDeLimite(LIMITES.modeloCodigo)),
  descricao: z
    .string()
    .min(2, 'Descrição deve ter pelo menos 2 caracteres.')
    .max(LIMITES.modeloDescricao, mensagemDeLimite(LIMITES.modeloDescricao)),
  observacoes: z.string().max(LIMITES.textoLongo, mensagemDeLimite(LIMITES.textoLongo)).optional(),
  maquina: z
    .string()
    .min(1, 'Máquina/Encaixe é obrigatório.')
    .max(LIMITES.modeloMaquina, mensagemDeLimite(LIMITES.modeloMaquina)),
  tipo: z.union([tipoModeloSchema, z.literal('')]).optional(),
});

export const editarModeloSchema = z.object({
  codigo: z
    .string()
    .min(1, 'Código é obrigatório.')
    .max(LIMITES.modeloCodigo, mensagemDeLimite(LIMITES.modeloCodigo)),
  descricao: z
    .string()
    .min(2, 'Descrição deve ter pelo menos 2 caracteres.')
    .max(LIMITES.modeloDescricao, mensagemDeLimite(LIMITES.modeloDescricao)),
  observacoes: z.string().max(LIMITES.textoLongo, mensagemDeLimite(LIMITES.textoLongo)).optional(),
  maquina: z
    .string()
    .min(1, 'Máquina/Encaixe é obrigatório.')
    .max(LIMITES.modeloMaquina, mensagemDeLimite(LIMITES.modeloMaquina)),
  tipo: z.union([tipoModeloSchema, z.literal('')]).optional(),
});

export type CriarModeloFormData = z.infer<typeof criarModeloSchema>;
export type EditarModeloFormData = z.infer<typeof editarModeloSchema>;
