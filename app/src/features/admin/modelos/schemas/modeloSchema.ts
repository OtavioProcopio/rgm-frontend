import { z } from 'zod';

import { LIMITES, mensagemDeLimite } from '@/shared/lib/limites';

const tipoModeloSchema = z.enum([
  'PLACA_ALUMINIO',
  'MADEIRA_E_3D',
  'ALUMINIO_E_3D',
  'RESINA',
  'COQUILHA_ACO',
]);

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
