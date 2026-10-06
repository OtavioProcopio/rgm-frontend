import { ApiError } from '@/shared/api/apiError';

const ESPERA_INICIAL_MS = 3_000;
const ESPERA_MAXIMA_MS = 30_000;

/** Status com que a API recusa a renovação de uma sessão que não vale mais. */
const STATUS_DE_SESSAO_EXPIRADA = [400, 401, 403];

/** Espera antes da tentativa de reconexão: dobra a cada falha seguida, até o teto. */
export function esperaDaTentativa(tentativa: number): number {
  const dobras = Math.max(tentativa, 1) - 1;
  return Math.min(ESPERA_INICIAL_MS * 2 ** dobras, ESPERA_MAXIMA_MS);
}

/**
 * Diz se a falha da renovação significa sessão expirada. Qualquer outra falha (sem rede,
 * erro do servidor) é passageira e merece nova tentativa.
 */
export function sessaoExpirou(erro: unknown): boolean {
  return erro instanceof ApiError && STATUS_DE_SESSAO_EXPIRADA.includes(erro.status);
}
