import { z } from 'zod';

import { LIMITES, mensagemDeLimite } from '@/shared/lib/limites';

export const tipoModeloSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório.')
    .max(LIMITES.tipoModeloNome, mensagemDeLimite(LIMITES.tipoModeloNome)),
});

export type TipoModeloFormData = z.infer<typeof tipoModeloSchema>;
