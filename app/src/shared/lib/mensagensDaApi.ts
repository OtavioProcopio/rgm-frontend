import { ApiError } from '@/shared/api/apiError';

/**
 * Frases que o backend devolve sem acento e que o usuário vê com frequência. A chave é o texto
 * do backend em minúsculas; só o texto conhecido é trocado, o resto segue como veio.
 */
const MENSAGENS_POR_TEXTO: Record<string, string> = {
  'senha deve ter no minimo 8 caracteres': 'A senha deve ter no mínimo 8 caracteres.',
  'senha atual incorreta': 'Senha atual incorreta.',
  'usuario nao tem acesso a esta solicitacao': 'Você não tem acesso a esta solicitação.',
  'este registro foi alterado por outro usuario. recarregue e tente novamente.':
    'Este registro foi alterado por outra pessoa. Recarregue e tente novamente.',
};

const MENSAGENS_POR_STATUS: Record<number, string> = {
  401: 'Sua sessão expirou. Entre novamente.',
};

export function mensagemDaApi(error: unknown): string | null {
  if (!(error instanceof ApiError)) {
    return null;
  }
  const texto: string = error.message.trim().toLowerCase();
  return MENSAGENS_POR_TEXTO[texto] ?? MENSAGENS_POR_STATUS[error.status] ?? null;
}
