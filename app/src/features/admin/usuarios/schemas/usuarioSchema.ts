import { z } from 'zod';

import { LIMITES, mensagemDeLimite } from '@/shared/lib/limites';
import { erroDaSenha } from '@/shared/lib/senha';

const nomeDoUsuario = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres.')
  .max(LIMITES.usuarioNome, mensagemDeLimite(LIMITES.usuarioNome));
const emailDoUsuario = z
  .string()
  .max(LIMITES.usuarioEmail, mensagemDeLimite(LIMITES.usuarioEmail))
  .email('E-mail inválido.');

export const perfilUsuarioSchema = z.enum(['OPERADOR', 'GESTOR', 'ADMINISTRADOR', 'EXTERNO']);

export const criarUsuarioSchema = z
  .object({
    nome: nomeDoUsuario,
    email: emailDoUsuario.optional().or(z.literal('')),
    senha: z.string().optional(),
    perfil: perfilUsuarioSchema,
    ativo: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.perfil !== 'EXTERNO') {
      if (!data.email) {
        ctx.addIssue({
          code: 'custom',
          path: ['email'],
          message: 'E-mail é obrigatório para usuários internos.',
        });
      }

      const erro = erroDaSenha(data.senha ?? '');
      if (erro) {
        ctx.addIssue({ code: 'custom', path: ['senha'], message: erro });
      }
    }
  });

export const editarUsuarioSchema = z.object({
  nome: nomeDoUsuario,
  email: emailDoUsuario,
});

export type CriarUsuarioFormData = z.infer<typeof criarUsuarioSchema>;
export type EditarUsuarioFormData = z.infer<typeof editarUsuarioSchema>;
