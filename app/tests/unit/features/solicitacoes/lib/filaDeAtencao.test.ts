import { describe, expect, it } from 'vitest';

import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import {
  itensDaFila,
  ordenarPorAtraso,
  responsaveisEmTexto,
} from '@/features/solicitacoes/lib/filaDeAtencao';

const HORA = 3_600_000;
const DIA = 24 * HORA;
const AGORA = Date.parse('2026-10-09T12:00:00Z');
const iso = (ms: number) => new Date(ms).toISOString();
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

function comPrazo(id: string, prazoMs: number | null, extra = {}) {
  return criarSolicitacao({
    id,
    prazoLimite: prazoMs === null ? null : iso(prazoMs),
    ...extra,
  });
}

const ids = (lista: { id: string }[]) => lista.map((item) => item.id);

describe('ordenarPorAtraso', () => {
  it('deve colocar a mais atrasada primeiro quando os prazos são diferentes', () => {
    // Arrange
    const entrada = [comPrazo('b', AGORA - DIA), comPrazo('a', AGORA - 3 * DIA)];

    // Act
    const ordenada = ordenarPorAtraso(entrada);

    // Assert
    expect(ids(ordenada)).toEqual(['a', 'b']);
  });

  it('deve manter a ordem quando a entrada já está da mais atrasada para a menos atrasada', () => {
    // Arrange
    const entrada = [comPrazo('a', AGORA - 3 * DIA), comPrazo('b', AGORA - DIA)];

    // Act
    const ordenada = ordenarPorAtraso(entrada);

    // Assert
    expect(ids(ordenada)).toEqual(['a', 'b']);
  });

  it('deve mandar para o fim quando não há prazo limite', () => {
    // Arrange
    const entrada = [comPrazo('sem', null), comPrazo('com', AGORA - DIA)];

    // Act
    const ordenada = ordenarPorAtraso(entrada);

    // Assert
    expect(ids(ordenada)).toEqual(['com', 'sem']);
  });

  it('deve mandar para o fim quando o prazo limite é uma data inválida', () => {
    // Arrange
    const entrada = [comPrazo('ruim', null, { prazoLimite: 'lixo' }), comPrazo('ok', AGORA)];

    // Act
    const ordenada = ordenarPorAtraso(entrada);

    // Assert
    expect(ids(ordenada)).toEqual(['ok', 'ruim']);
  });

  it('deve manter a ordem de chegada quando os prazos empatam', () => {
    // Arrange
    const entrada = [comPrazo('x', AGORA), comPrazo('y', AGORA), comPrazo('z', AGORA)];

    // Act
    const ordenada = ordenarPorAtraso(entrada);

    // Assert
    expect(ids(ordenada)).toEqual(['x', 'y', 'z']);
  });

  it('deve manter a ordem de chegada quando todas estão sem prazo', () => {
    // Arrange
    const entrada = [comPrazo('p', null), comPrazo('q', null)];

    // Act
    const ordenada = ordenarPorAtraso(entrada);

    // Assert
    expect(ids(ordenada)).toEqual(['p', 'q']);
  });

  it('deve devolver um novo array sem mutar a entrada', () => {
    // Arrange
    const entrada = [comPrazo('b', AGORA), comPrazo('a', AGORA - DIA)];

    // Act
    const ordenada = ordenarPorAtraso(entrada);

    // Assert
    expect(ordenada).not.toBe(entrada);
    expect(ids(entrada)).toEqual(['b', 'a']);
  });

  it('deve devolver lista vazia quando não há solicitações', () => {
    // Arrange
    const entrada: ReturnType<typeof comPrazo>[] = [];

    // Act
    const ordenada = ordenarPorAtraso(entrada);

    // Assert
    expect(ordenada).toEqual([]);
  });
});

describe('responsaveisEmTexto', () => {
  it('deve unir os nomes por vírgula quando a API traz os responsáveis', () => {
    // Arrange
    const solicitacao = criarSolicitacao({
      responsaveis: [
        { id: 'u1', nome: 'Ana' },
        { id: 'u2', nome: 'Bruno' },
      ],
      responsavelIds: ['u1', 'u2'],
    });

    // Act
    const texto = responsaveisEmTexto(solicitacao);

    // Assert
    expect(texto).toBe('Ana, Bruno');
  });

  it('deve dizer "1 responsável" quando só há um identificador', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ responsavelIds: ['u1'] });

    // Act
    const texto = responsaveisEmTexto(solicitacao);

    // Assert
    expect(texto).toBe('1 responsável');
  });

  it('deve dizer "3 responsáveis" quando há três identificadores', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ responsavelIds: ['u1', 'u2', 'u3'] });

    // Act
    const texto = responsaveisEmTexto(solicitacao);

    // Assert
    expect(texto).toBe('3 responsáveis');
  });

  it('deve dizer "Sem responsável" quando não há nomes nem identificadores', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ responsaveis: [], responsavelIds: [] });

    // Act
    const texto = responsaveisEmTexto(solicitacao);

    // Assert
    expect(texto).toBe('Sem responsável');
  });

  it('deve dizer "Sem responsável" quando a lista de responsáveis é nula', () => {
    // Arrange
    const solicitacao = criarSolicitacao({ responsaveis: null, responsavelIds: [] });

    // Act
    const texto = responsaveisEmTexto(solicitacao);

    // Assert
    expect(texto).toBe('Sem responsável');
  });

  it('deve omitir o uuid do texto quando só há identificadores', () => {
    // Arrange
    const uuid = '123e4567-e89b-42d3-a456-426614174000';
    const solicitacao = criarSolicitacao({ responsavelIds: [uuid] });

    // Act
    const texto = responsaveisEmTexto(solicitacao);

    // Assert
    expect(texto).not.toMatch(UUID);
  });
});

describe('itensDaFila', () => {
  it('deve devolver lista vazia quando não há solicitações', () => {
    // Arrange
    const entrada: ReturnType<typeof comPrazo>[] = [];

    // Act
    const itens = itensDaFila(entrada, AGORA);

    // Assert
    expect(itens).toEqual([]);
  });

  it('deve limitar a 5 itens quando chegam 8 solicitações', () => {
    // Arrange
    const entrada = Array.from({ length: 8 }, (_, i) => comPrazo(`s${i}`, AGORA - i * HORA));

    // Act
    const itens = itensDaFila(entrada, AGORA);

    // Assert
    expect(ids(itens)).toEqual(['s7', 's6', 's5', 's4', 's3']);
  });

  it('deve manter o título inteiro quando ele passa de 80 caracteres', () => {
    // Arrange
    const titulo = 'T'.repeat(120);
    const entrada = [comPrazo('a', AGORA, { titulo })];

    // Act
    const [item] = itensDaFila(entrada, AGORA);

    // Assert
    expect(item.titulo).toBe(titulo);
  });

  it('deve montar o link da solicitação quando mapeia o item', () => {
    // Arrange
    const entrada = [comPrazo('abc', AGORA)];

    // Act
    const [item] = itensDaFila(entrada, AGORA);

    // Assert
    expect(item.href).toBe('/app/solicitacoes/abc');
  });

  it('deve usar o rótulo do status como etapa', () => {
    // Arrange
    const entrada = [comPrazo('a', AGORA, { status: 'EM_VALIDACAO' })];

    // Act
    const [item] = itensDaFila(entrada, AGORA);

    // Assert
    expect(item.etapa).toBe('Em validação');
  });

  it('deve repassar o modelo e os responsáveis em texto quando mapeia o item', () => {
    // Arrange
    const entrada = [comPrazo('a', AGORA, { modeloId: 'm9', responsavelIds: ['u1', 'u2'] })];

    // Act
    const [item] = itensDaFila(entrada, AGORA);

    // Assert
    expect([item.modeloId, item.responsaveis]).toEqual(['m9', '2 responsáveis']);
  });

  it('deve devolver modeloId nulo quando a solicitação ainda não tem modelo', () => {
    // Arrange
    const entrada = [comPrazo('a', AGORA, { modeloId: null })];

    // Act
    const [item] = itensDaFila(entrada, AGORA);

    // Assert
    expect(item.modeloId).toBeNull();
  });

  it('deve trazer o atraso de situacaoDoPrazo quando a aberta venceu há 2 dias', () => {
    // Arrange
    const vencida = comPrazo('a', AGORA - 2 * DIA, {
      status: 'EM_ANDAMENTO',
      criadaEm: iso(AGORA - 5 * DIA),
    });

    // Act
    const [item] = itensDaFila([vencida], AGORA);

    // Assert
    expect(item.atraso).toBe('Atrasada há 2 d');
  });

  it('deve deixar o atraso nulo quando não há prazo limite', () => {
    // Arrange
    const entrada = [comPrazo('a', null)];

    // Act
    const [item] = itensDaFila(entrada, AGORA);

    // Assert
    expect(item.atraso).toBeNull();
  });
});
