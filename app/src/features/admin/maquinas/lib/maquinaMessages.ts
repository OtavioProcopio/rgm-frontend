import { ApiError } from '@/shared/api/apiError';

export function getMaquinaErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível concluir a operação. Tente novamente.';
  }

  if (error.message.toLowerCase().includes('ja existe uma maquina com esse nome')) {
    return 'Já existe uma máquina com esse nome.';
  }

  switch (error.status) {
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 403:
      return error.message || 'Você não tem permissão para gerenciar o catálogo de máquinas.';
    case 404:
      return 'Máquina não encontrada.';
    case 500:
      return 'Erro interno. Tente novamente mais tarde.';
    default:
      return error.message || 'Não foi possível concluir a operação. Tente novamente.';
  }
}
