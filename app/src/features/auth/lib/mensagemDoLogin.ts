import { ApiError } from '@/shared/api/apiError';

export const MENSAGEM_CREDENCIAL_INVALIDA = 'E-mail ou senha inválidos.';
export const MENSAGEM_EXCESSO_DE_TENTATIVAS = 'Muitas tentativas. Tente de novo em 1 minuto.';
export const MENSAGEM_SEM_CONEXAO =
  'Sem conexão com o servidor. Verifique sua rede e tente de novo.';
export const MENSAGEM_LOGIN_DESCONHECIDO =
  'Não foi possível entrar agora. Tente novamente em instantes.';

/** A frase de cada falha do login. O status HTTP decide: o corpo do 429 não é confiável. */
export function mensagemDoLogin(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return MENSAGEM_CREDENCIAL_INVALIDA;
    if (error.status === 429) return MENSAGEM_EXCESSO_DE_TENTATIVAS;
    return MENSAGEM_LOGIN_DESCONHECIDO;
  }

  // `fetch` rejeita com TypeError quando não há resposta (rede caída, servidor fora do ar).
  if (error instanceof TypeError) return MENSAGEM_SEM_CONEXAO;

  return MENSAGEM_LOGIN_DESCONHECIDO;
}
