import type { Credenciais, SenhaAlteradaResponse } from '../types/authTypes';

/**
 * Credenciais novas devolvidas pela troca da própria senha. Devolve nulo quando a resposta
 * não traz o par completo (backend anterior à invalidação de sessão na troca): nesse caso
 * as credenciais em uso continuam valendo.
 */
export function credenciaisDaTroca(
  resposta: SenhaAlteradaResponse | null | undefined,
): Credenciais | null {
  const token = resposta?.token;
  const refreshToken = resposta?.refreshToken;
  if (!token || !refreshToken) return null;
  return { token, refreshToken };
}
