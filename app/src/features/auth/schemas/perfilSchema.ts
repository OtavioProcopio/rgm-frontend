import { z } from 'zod';

export const alterarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
    novaSenha: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres'),
    confirmarNovaSenha: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.novaSenha === data.confirmarNovaSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarNovaSenha'],
  });

export type AlterarSenhaFormData = z.infer<typeof alterarSenhaSchema>;
