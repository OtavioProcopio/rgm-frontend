import { z } from 'zod';

import { LIMITES, mensagemDeLimite } from '@/shared/lib/limites';

export const maquinaSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório.')
    .max(LIMITES.maquinaNome, mensagemDeLimite(LIMITES.maquinaNome)),
});

export type MaquinaFormData = z.infer<typeof maquinaSchema>;
