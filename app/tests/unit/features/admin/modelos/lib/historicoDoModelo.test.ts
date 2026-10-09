import { describe, expect, it } from 'vitest';
import { historicoDoModelo } from '@/features/admin/modelos/lib/historicoDoModelo';
import type { EventoModelo } from '@/features/admin/modelos/types/modeloTypes';
import type { Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';

function criarEvento(sobrescrita: Partial<EventoModelo> = {}): EventoModelo {
  return {
    id: 'ev-1',
    modeloId: 'mod-1',
    tipo: 'MODELO_CRIADO',
    titulo: 'Modelo criado',
    descricao: 'Descricao do evento',
    estadoModeloDescricao: null,
    executadoPorUsuarioId: null,
    solicitacaoRelacionadaId: null,
    criadoEm: '2026-01-01T10:00:00Z',
    ...sobrescrita,
  };
}

function criarSolicitacao(sobrescrita: Partial<Solicitacao> = {}): Solicitacao {
  return {
    id: 'sol-1',
    titulo: 'Reparo da base',
    descricao: 'Detalhes',
    tipo: 'REPARO',
    status: 'EM_ANDAMENTO',
    prioridade: null,
    modeloId: 'mod-1',
    abertaPorUsuarioId: 'u-1',
    comentarioFinal: null,
    criadaEm: '2026-01-02T10:00:00Z',
    atualizadaEm: '2026-01-02T10:00:00Z',
    concluidaEm: null,
    canceladaEm: null,
    responsavelIds: [],
    ...sobrescrita,
  };
}

describe('historicoDoModelo', () => {
  it('deve cobrir a solicitacao quando o evento a relaciona', () => {
    // Arrange
    const eventos = [criarEvento({ solicitacaoRelacionadaId: 'sol-1' })];
    const solicitacoes = [criarSolicitacao()];

    // Act
    const itens = historicoDoModelo(eventos, solicitacoes);

    // Assert
    expect(itens).toHaveLength(1);
    expect(itens[0].tipo).toBe('EVENTO');
    expect(itens[0].destino).toBe('/app/solicitacoes/sol-1');
  });

  it('deve gerar item de solicitacao quando nao ha evento relacionado', () => {
    // Arrange
    const solicitacoes = [criarSolicitacao({ status: 'CONCLUIDA' })];

    // Act
    const itens = historicoDoModelo([], solicitacoes);

    // Assert
    expect(itens).toEqual([
      {
        id: 'solicitacao-sol-1',
        em: '2026-01-02T10:00:00Z',
        tipo: 'SOLICITACAO',
        titulo: 'Reparo da base',
        detalhe: null,
        complemento: null,
        statusDaSolicitacao: 'CONCLUIDA',
        destino: '/app/solicitacoes/sol-1',
      },
    ]);
  });

  it('deve deixar o destino nulo quando o evento nao tem solicitacao relacionada', () => {
    // Arrange
    const eventos = [criarEvento()];

    // Act
    const itens = historicoDoModelo(eventos, []);

    // Assert
    expect(itens[0].destino).toBeNull();
    expect(itens[0].statusDaSolicitacao).toBeNull();
  });

  it('deve usar o tipo como detalhe quando o evento nao tem descricao', () => {
    // Arrange
    const eventos = [criarEvento({ descricao: null, tipo: 'MODELO_ATUALIZADO' })];

    // Act
    const itens = historicoDoModelo(eventos, []);

    // Assert
    expect(itens[0].detalhe).toBe('MODELO_ATUALIZADO');
  });

  it('deve levar o estado do modelo como complemento quando o evento o informa', () => {
    // Arrange
    const eventos = [criarEvento({ estadoModeloDescricao: 'Em manutencao' })];

    // Act
    const itens = historicoDoModelo(eventos, []);

    // Assert
    expect(itens[0].complemento).toBe('Em manutencao');
    expect(itens[0].em).toBe('2026-01-01T10:00:00Z');
    expect(itens[0].id).toBe('ev-1');
  });

  it('deve nao duplicar a solicitacao quando dois eventos a relacionam', () => {
    // Arrange
    const eventos = [
      criarEvento({ id: 'ev-1', solicitacaoRelacionadaId: 'sol-1' }),
      criarEvento({ id: 'ev-2', solicitacaoRelacionadaId: 'sol-1' }),
    ];

    // Act
    const itens = historicoDoModelo(eventos, [criarSolicitacao()]);

    // Assert
    expect(itens.map((item) => item.id)).toEqual(['ev-1', 'ev-2']);
  });

  it('deve devolver lista vazia quando eventos e solicitacoes estao vazios', () => {
    // Arrange
    const eventos: EventoModelo[] = [];
    const solicitacoes: Solicitacao[] = [];

    // Act
    const itens = historicoDoModelo(eventos, solicitacoes);

    // Assert
    expect(itens).toEqual([]);
  });

  it('deve devolver apenas itens de solicitacao quando nao ha eventos', () => {
    // Arrange
    const solicitacoes = [criarSolicitacao({ id: 'a' }), criarSolicitacao({ id: 'b' })];

    // Act
    const itens = historicoDoModelo([], solicitacoes);

    // Assert
    expect(itens.map((item) => item.id)).toEqual(['solicitacao-a', 'solicitacao-b']);
    expect(itens.every((item) => item.tipo === 'SOLICITACAO')).toBe(true);
  });

  it('deve devolver apenas itens de evento quando nao ha solicitacoes', () => {
    // Arrange
    const eventos = [criarEvento({ id: 'e1' }), criarEvento({ id: 'e2' })];

    // Act
    const itens = historicoDoModelo(eventos, []);

    // Assert
    expect(itens.map((item) => item.id)).toEqual(['e1', 'e2']);
    expect(itens.every((item) => item.tipo === 'EVENTO')).toBe(true);
  });

  it('deve manter eventos antes das solicitacoes quando ambos existem', () => {
    // Arrange
    const eventos = [criarEvento({ id: 'e1' })];
    const solicitacoes = [criarSolicitacao({ id: 'a' })];

    // Act
    const itens = historicoDoModelo(eventos, solicitacoes);

    // Assert
    expect(itens.map((item) => item.id)).toEqual(['e1', 'solicitacao-a']);
  });

  it('deve preservar os arrays de entrada quando gera o historico', () => {
    // Arrange
    const eventos = [criarEvento({ solicitacaoRelacionadaId: 'sol-1' })];
    const solicitacoes = [criarSolicitacao(), criarSolicitacao({ id: 'sol-2' })];
    const eventosAntes = structuredClone(eventos);
    const solicitacoesAntes = structuredClone(solicitacoes);

    // Act
    historicoDoModelo(eventos, solicitacoes);

    // Assert
    expect(eventos).toEqual(eventosAntes);
    expect(solicitacoes).toEqual(solicitacoesAntes);
  });
});
