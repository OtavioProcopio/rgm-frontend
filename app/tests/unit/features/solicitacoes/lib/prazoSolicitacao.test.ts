import { describe, expect, it } from 'vitest';

import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import {
  idadeEmDias,
  prazoDoResumo,
  situacaoDoPrazo,
} from '@/features/solicitacoes/lib/prazoSolicitacao';
import { formatarDuracao } from '@/shared/lib/duracao';

const HORA = 3_600_000;
const ABERTURA = Date.parse('2026-10-01T12:00:00Z');
const iso = (ms: number) => new Date(ms).toISOString();

/** Solicitação em andamento aberta em ABERTURA, com prazo de `prazoHoras`. */
function emAndamento(prazoHoras: number, extra = {}) {
  return criarSolicitacao({
    status: 'EM_ANDAMENTO',
    prioridade: 'ALTA',
    criadaEm: iso(ABERTURA),
    prazoLimite: iso(ABERTURA + prazoHoras * HORA),
    atrasada: false,
    ...extra,
  });
}

describe('situacaoDoPrazo', () => {
  it('deve dizer há quanto tempo está atrasada quando o prazo venceu', () => {
    const agora = ABERTURA + 29 * HORA;

    const situacao = situacaoDoPrazo(emAndamento(24, { atrasada: true }), agora);

    expect(situacao).toEqual({ tom: 'atraso', rotulo: 'Atrasada há 5 h' });
  });

  it('deve tratar como atrasada quando a API diz que está, mesmo com o relógio local antes do prazo', () => {
    const agora = ABERTURA + 23 * HORA;

    const situacao = situacaoDoPrazo(emAndamento(24, { atrasada: true }), agora);

    expect(situacao).toEqual({ tom: 'atraso', rotulo: 'Atrasada' });
  });

  it('deve tratar como atrasada quando o prazo passou no relógio local e a API ainda não marcou', () => {
    const agora = ABERTURA + 26 * HORA;

    const situacao = situacaoDoPrazo(emAndamento(24), agora);

    expect(situacao).toEqual({ tom: 'atraso', rotulo: 'Atrasada há 2 h' });
  });

  it('deve dizer quanto falta, com atenção, quando resta um quarto do prazo ou menos', () => {
    const agora = ABERTURA + 20 * HORA;

    const situacao = situacaoDoPrazo(emAndamento(24), agora);

    expect(situacao).toEqual({ tom: 'atencao', rotulo: 'Vence em 4 h' });
  });

  it('deve dizer quanto falta, sem destaque, quando passou da metade e resta mais de um quarto', () => {
    const agora = ABERTURA + 14 * HORA;

    const situacao = situacaoDoPrazo(emAndamento(24), agora);

    expect(situacao).toEqual({ tom: 'neutro', rotulo: 'Vence em 10 h' });
  });

  it('deve mostrar o selo exatamente na metade do prazo', () => {
    const agora = ABERTURA + 12 * HORA;

    const situacao = situacaoDoPrazo(emAndamento(24), agora);

    expect(situacao).toEqual({ tom: 'neutro', rotulo: 'Vence em 12 h' });
  });

  it('deve ficar sem selo quando ainda não passou metade do prazo', () => {
    const agora = ABERTURA + 2 * HORA;

    const situacao = situacaoDoPrazo(emAndamento(24), agora);

    expect(situacao).toBeNull();
  });

  it('deve ignorar a última atualização ao calcular o prazo', () => {
    const agora = ABERTURA + 29 * HORA;
    const editadaAgora = emAndamento(24, { atrasada: true, atualizadaEm: iso(agora) });

    const situacao = situacaoDoPrazo(editadaAgora, agora);

    expect(situacao?.tom).toBe('atraso');
  });

  it('deve dizer "Fora do prazo" quando a concluída está marcada como atrasada', () => {
    const concluida = emAndamento(24, { status: 'CONCLUIDA', atrasada: true });

    const situacao = situacaoDoPrazo(concluida, ABERTURA + 500 * HORA);

    expect(situacao).toEqual({ tom: 'atraso', rotulo: 'Fora do prazo' });
  });

  it('deve dizer "No prazo" quando a concluída não está marcada como atrasada', () => {
    const concluida = emAndamento(24, { status: 'CONCLUIDA', atrasada: false });

    const situacao = situacaoDoPrazo(concluida, ABERTURA + 500 * HORA);

    expect(situacao).toEqual({ tom: 'ok', rotulo: 'No prazo' });
  });

  it('deve ficar sem selo quando a solicitação está cancelada', () => {
    const cancelada = emAndamento(24, { status: 'CANCELADA' });

    const situacao = situacaoDoPrazo(cancelada, ABERTURA + 500 * HORA);

    expect(situacao).toBeNull();
  });

  it('deve ficar sem selo quando a API não informa o prazo', () => {
    const semPrazo = criarSolicitacao({ status: 'A_FAZER', prioridade: null });

    const situacao = situacaoDoPrazo(semPrazo, ABERTURA);

    expect(situacao).toBeNull();
  });

  it('deve ficar sem selo quando a concluída vem sem prazo', () => {
    const concluidaSemPrazo = criarSolicitacao({ status: 'CONCLUIDA', prioridade: 'ALTA' });

    const situacao = situacaoDoPrazo(concluidaSemPrazo, ABERTURA);

    expect(situacao).toBeNull();
  });
});

describe('situacaoDoPrazo com prazo muito distante', () => {
  it('deve ficar sem selo quando a aberta tem muito prazo restante', () => {
    // Arrange
    const aberta = emAndamento(48);
    const agora = ABERTURA + 2 * HORA;

    // Act
    const situacao = situacaoDoPrazo(aberta, agora);

    // Assert
    expect(situacao).toBeNull();
  });

  it('deve ficar sem selo quando o prazo limite não é uma data válida', () => {
    // Arrange
    const malformada = emAndamento(24, { prazoLimite: 'lixo' });

    // Act
    const situacao = situacaoDoPrazo(malformada, ABERTURA + 20 * HORA);

    // Assert
    expect(situacao).toBeNull();
  });
});

describe('prazoDoResumo', () => {
  it('deve mostrar quanto falta, sem destaque, quando a aberta tem muito prazo restante', () => {
    // Arrange
    const aberta = emAndamento(48);
    const agora = ABERTURA + 2 * HORA;

    // Act
    const resumo = prazoDoResumo(aberta, agora);

    // Assert
    expect(resumo).toEqual({ tom: 'neutro', rotulo: 'Vence em 46 h' });
  });

  it('deve devolver nulo quando o prazo limite não é uma data válida', () => {
    // Arrange
    const malformada = emAndamento(24, { prazoLimite: 'lixo' });

    // Act
    const resumo = prazoDoResumo(malformada, ABERTURA + 2 * HORA);

    // Assert
    expect(resumo).toBeNull();
  });

  it('deve mostrar quanto falta, com atenção, quando resta um quarto do prazo ou menos', () => {
    // Arrange
    const aberta = emAndamento(24);
    const agora = ABERTURA + 20 * HORA;

    // Act
    const resumo = prazoDoResumo(aberta, agora);

    // Assert
    expect(resumo).toEqual({ tom: 'atencao', rotulo: 'Vence em 4 h' });
  });

  it('deve dizer há quanto tempo está atrasada quando a aberta passou do prazo', () => {
    // Arrange
    const aberta = emAndamento(24);
    const agora = ABERTURA + 72 * HORA;

    // Act
    const resumo = prazoDoResumo(aberta, agora);

    // Assert
    expect(resumo).toEqual({ tom: 'atraso', rotulo: 'Atrasada há 2 d' });
  });

  it('deve dizer apenas "Atrasada" quando a API marca atraso e o prazo ainda está no futuro', () => {
    // Arrange
    const aberta = emAndamento(24, { atrasada: true });
    const agora = ABERTURA + 10 * HORA;

    // Act
    const resumo = prazoDoResumo(aberta, agora);

    // Assert
    expect(resumo).toEqual({ tom: 'atraso', rotulo: 'Atrasada' });
  });

  it('deve dizer "No prazo" quando a concluída não está marcada como atrasada', () => {
    // Arrange
    const concluida = emAndamento(24, { status: 'CONCLUIDA', atrasada: false });

    // Act
    const resumo = prazoDoResumo(concluida, ABERTURA + 500 * HORA);

    // Assert
    expect(resumo).toEqual({ tom: 'ok', rotulo: 'No prazo' });
  });

  it('deve dizer "Fora do prazo" quando a concluída está marcada como atrasada', () => {
    // Arrange
    const concluida = emAndamento(24, { status: 'CONCLUIDA', atrasada: true });

    // Act
    const resumo = prazoDoResumo(concluida, ABERTURA + 500 * HORA);

    // Assert
    expect(resumo).toEqual({ tom: 'atraso', rotulo: 'Fora do prazo' });
  });

  it('deve devolver nulo quando a solicitação está cancelada', () => {
    // Arrange
    const cancelada = emAndamento(24, { status: 'CANCELADA' });

    // Act
    const resumo = prazoDoResumo(cancelada, ABERTURA + 2 * HORA);

    // Assert
    expect(resumo).toBeNull();
  });

  it('deve devolver nulo quando a API não informa o prazo', () => {
    // Arrange
    const semPrazo = criarSolicitacao({ status: 'A_FAZER', prioridade: null });

    // Act
    const resumo = prazoDoResumo(semPrazo, ABERTURA);

    // Assert
    expect(resumo).toBeNull();
  });
});

describe('formatarDuracao', () => {
  it('deve escrever em minutos quando é menos de 1 hora', () => {
    expect(formatarDuracao(59 * 60_000)).toBe('59 min');
  });

  it('deve escrever pelo menos 1 minuto quando é menos que isso', () => {
    expect(formatarDuracao(20_000)).toBe('1 min');
  });

  it('deve escrever em horas a partir de 1 hora', () => {
    expect(formatarDuracao(HORA)).toBe('1 h');
  });

  it('deve escrever em horas quando é menos de 48 horas', () => {
    expect(formatarDuracao(47 * HORA)).toBe('47 h');
  });

  it('deve escrever em dias a partir de 48 horas', () => {
    expect(formatarDuracao(48 * HORA)).toBe('2 d');
  });
});

describe('idadeEmDias', () => {
  it('deve contar os dias inteiros desde a abertura quando a solicitação está em aberto', () => {
    const aberta = criarSolicitacao({
      status: 'EM_VALIDACAO',
      prioridade: 'ALTA',
      criadaEm: iso(ABERTURA),
    });

    expect(idadeEmDias(aberta, ABERTURA + 60 * HORA)).toBe(2);
  });

  it('deve devolver nulo quando a solicitação está concluída', () => {
    const concluida = criarSolicitacao({
      status: 'CONCLUIDA',
      prioridade: 'ALTA',
      criadaEm: iso(ABERTURA),
    });

    expect(idadeEmDias(concluida, ABERTURA + 60 * HORA)).toBeNull();
  });

  it('deve devolver nulo quando a solicitação está cancelada', () => {
    const cancelada = criarSolicitacao({ status: 'CANCELADA', criadaEm: iso(ABERTURA) });

    expect(idadeEmDias(cancelada, ABERTURA + 60 * HORA)).toBeNull();
  });
});
