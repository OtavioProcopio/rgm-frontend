import { ApiError } from '@/shared/api/apiError';

export function getUsuarioErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível concluir a operação. Tente novamente.';
  }

  if (error.message.toLowerCase().includes('email ja cadastrado')) {
    return 'Este e-mail já está cadastrado.';
  }

  switch (error.status) {
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 403:
      return error.message || 'Você não tem permissão para acessar esta área.';
    case 500:
      return 'Erro interno. Tente novamente mais tarde.';
    default:
      return error.message || 'Não foi possível concluir a operação. Tente novamente.';
  }
}
