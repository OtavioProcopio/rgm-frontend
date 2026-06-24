import { ApiError } from '@/shared/api/apiError';

export function getMaquinaErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível concluir a operação. Tente novamente.';
  }

  if (error.message.toLowerCase().includes('maquina nao encontrada')) {
    return 'Máquina não encontrada.';
  }

  switch (error.status) {
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 403:
      return error.message || 'Você não tem permissão para esta ação.';
    case 500:
      return 'Erro interno. Tente novamente mais tarde.';
    default:
      return error.message || 'Não foi possível concluir a operação. Tente novamente.';
  }
}
