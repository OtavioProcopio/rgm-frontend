import { z } from 'zod';

import { MENSAGEM_DA_SENHA, TAMANHO_MINIMO_DA_SENHA } from '@/shared/lib/senha';

export const alterarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
    novaSenha: z.string().min(TAMANHO_MINIMO_DA_SENHA, MENSAGEM_DA_SENHA),
    confirmarNovaSenha: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.novaSenha === data.confirmarNovaSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarNovaSenha'],
  });

export type AlterarSenhaFormData = z.infer<typeof alterarSenhaSchema>;
