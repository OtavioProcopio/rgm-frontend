import { z } from 'zod';

export const perfilUsuarioSchema = z.enum(['OPERADOR', 'GESTOR', 'ADMINISTRADOR', 'EXTERNO']);

export const criarUsuarioSchema = z
  .object({
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
    email: z.string().email('E-mail inválido.').optional().or(z.literal('')),
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

      if (!data.senha || data.senha.length < 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['senha'],
          message: 'Senha deve ter pelo menos 6 caracteres.',
        });
      }
    }
  });

export const editarUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('E-mail inválido.'),
});

export type CriarUsuarioFormData = z.infer<typeof criarUsuarioSchema>;
export type EditarUsuarioFormData = z.infer<typeof editarUsuarioSchema>;
