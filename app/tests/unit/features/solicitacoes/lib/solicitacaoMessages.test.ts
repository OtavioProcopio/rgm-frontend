import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/api/apiError';
import {
  rotuloDaPrioridade,
  rotuloDoStatus,
  rotuloDoTipoDeSolicitacao,
} from '@/shared/lib/rotulos';

import {
  formatDuracao,
  getSolicitacaoErrorMessage,
  mensagemFotoNaoEnviadaAntes,
  prioridadeLabel,
  statusLabel,
  tipoLabel,
} from '@/features/solicitacoes/lib/solicitacaoMessages';

describe('solicitacaoMessages', () => {
  it('statusLabel covers all statuses', () => {
    expect(statusLabel['A_FAZER']).toBe('A fazer');
    expect(statusLabel['EM_ANDAMENTO']).toBe('Em andamento');
    expect(statusLabel['EM_VALIDACAO']).toBe('Em validação');
    expect(statusLabel['CONCLUIDA']).toBe('Concluída');
    expect(statusLabel['CANCELADA']).toBe('Cancelada');
  });

  it('prioridadeLabel covers all priorities', () => {
    expect(prioridadeLabel['BAIXA']).toBe('Baixa');
    expect(prioridadeLabel['MEDIA']).toBe('Média');
    expect(prioridadeLabel['ALTA']).toBe('Alta');
    expect(prioridadeLabel['URGENTE']).toBe('Urgente');
  });

  it('tipoLabel covers all types', () => {
    expect(tipoLabel['REPARO']).toBe('Reparo');
    expect(tipoLabel['INSPECAO']).toBe('Inspeção');
    expect(tipoLabel['REENGENHARIA']).toBe('Reengenharia');
  });

  it('getSolicitacaoErrorMessage returns ApiError message when available', () => {
    const err = new ApiError({ status: 403, message: 'Acesso negado' });
    expect(getSolicitacaoErrorMessage(err)).toBe('Acesso negado');
  });

  it('getSolicitacaoErrorMessage returns generic message for unknown errors', () => {
    expect(getSolicitacaoErrorMessage(new Error('qualquer'))).toBe('Ocorreu um erro inesperado.');
    expect(getSolicitacaoErrorMessage('string')).toBe('Ocorreu um erro inesperado.');
    expect(getSolicitacaoErrorMessage(null)).toBe('Ocorreu um erro inesperado.');
  });

  it('formatDuracao shows hours when under 24h', () => {
    expect(formatDuracao(3600)).toBe('1h');
    expect(formatDuracao(7200)).toBe('2h');
  });

  it('deve mostrar minutos quando a duração é de 12 minutos', () => {
    // Arrange
    const segundos: number = 12 * 60;

    // Act
    const texto: string = formatDuracao(segundos);

    // Assert
    expect(texto).toBe('12 min');
  });

  it('deve mostrar segundos quando a duração é de 45 segundos', () => {
    // Arrange
    const segundos: number = 45;

    // Act
    const texto: string = formatDuracao(segundos);

    // Assert
    expect(texto).toBe('45 s');
  });

  it('deve mostrar "0 s" quando a duração é zero', () => {
    // Arrange
    const segundos: number = 0;

    // Act
    const texto: string = formatDuracao(segundos);

    // Assert
    expect(texto).toBe('0 s');
  });

  it('deve mostrar 59 min quando a duração é de 3599 segundos', () => {
    // Arrange
    const segundos: number = 3599;

    // Act
    const texto: string = formatDuracao(segundos);

    // Assert
    expect(texto).toBe('59 min');
  });

  it('deve mostrar 1h quando a duração é de 3600 segundos', () => {
    // Arrange
    const segundos: number = 3600;

    // Act
    const texto: string = formatDuracao(segundos);

    // Assert
    expect(texto).toBe('1h');
  });

  it('formatDuracao shows days and hours when 24h or more', () => {
    expect(formatDuracao(24 * 3600)).toBe('1d 0h');
    expect(formatDuracao(25 * 3600)).toBe('1d 1h');
    expect(formatDuracao(50 * 3600)).toBe('2d 2h');
  });
});

describe('solicitacaoMessages — rótulos de uma fonte só', () => {
  it.each([
    { nome: 'statusLabel', exportado: statusLabel, fonte: rotuloDoStatus },
    { nome: 'prioridadeLabel', exportado: prioridadeLabel, fonte: rotuloDaPrioridade },
    { nome: 'tipoLabel', exportado: tipoLabel, fonte: rotuloDoTipoDeSolicitacao },
  ])(
    'deve reexportar o mapa de rótulos compartilhado quando $nome é importado',
    ({ exportado, fonte }) => {
      // Act
      const mapa: Record<string, string> = exportado;

      // Assert
      expect(mapa).toBe(fonte);
    },
  );
});

describe('mensagemFotoNaoEnviadaAntes', () => {
  it('deve dizer que nada foi concluído e incluir o motivo quando a API recusa a foto', () => {
    // Arrange
    const recusa = new ApiError({ status: 422, message: 'Arquivo excede o tamanho máximo.' });

    // Act
    const mensagem = mensagemFotoNaoEnviadaAntes(recusa);

    // Assert
    expect(mensagem).toBe(
      `A foto não foi enviada e a solicitação não foi concluída. ${recusa.message}`,
    );
  });

  it('deve dizer só que nada foi concluído quando a falha não veio da API', () => {
    // Act
    const mensagem = mensagemFotoNaoEnviadaAntes(new TypeError('Failed to fetch'));

    // Assert
    expect(mensagem).toBe('A foto não foi enviada e a solicitação não foi concluída.');
  });
});
