import { ApiError } from '@/shared/api/apiError';

export function getMaquinaErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível concluir a operação. Tente novamente.';
  }

  if (error.message.toLowerCase().includes('maquina nao encontrada')) {
    return 'Máquina não encontrada.';
  }

  switch (error.status) {
    case 400:
      return 'Dados inválidos. Verifique os campos.';
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para esta ação.';
    case 404:
      return 'Registro não encontrado.';
    case 409:
      return 'Não foi possível concluir por conflito de dados.';
    case 422:
      return error.message || 'Regra de negócio violada.';
    case 500:
      return 'Erro interno. Tente novamente mais tarde.';
    default:
      return error.message || 'Não foi possível concluir a operação. Tente novamente.';
  }
}
