import { ApiError } from '@/shared/api/apiError';

/** Os rótulos dos valores da API têm uma fonte só; aqui ficam os nomes que a feature já usa. */
export {
  rotuloDaPrioridade as prioridadeLabel,
  rotuloDoStatus as statusLabel,
  rotuloDoTipoDeSolicitacao as tipoLabel,
} from '@/shared/lib/rotulos';

export function getSolicitacaoErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado.';
}

/** Frase do aviso quando a ação foi feita e a foto que a acompanha não foi enviada. */
export const acaoFeitaSemFoto = {
  ABRIR: 'A solicitação foi aberta, mas a foto não foi enviada.',
  TRIAR: 'A solicitação foi triada, mas a foto não foi enviada.',
  DEVOLVER: 'A solicitação foi devolvida, mas a foto não foi enviada.',
} as const;

/** Erro do formulário quando a foto vai antes da ação e o envio falha: nada foi feito. */
export function mensagemFotoNaoEnviadaAntes(error: unknown): string {
  const motivo = error instanceof ApiError && error.message ? ` ${error.message}` : '';
  return `A foto não foi enviada e a solicitação não foi concluída.${motivo}`;
}

export function formatDuracao(segundos: number): string {
  const horas = segundos / 3600;
  if (horas < 24) {
    return `${Math.round(horas)}h`;
  }
  const dias = Math.floor(horas / 24);
  const horasRestantes = Math.round(horas % 24);
  return `${dias}d ${horasRestantes}h`;
}
