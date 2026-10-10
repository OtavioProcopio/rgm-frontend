import { describe, expect, it } from 'vitest';

import type { VisaoDaDistribuicao } from '@/features/solicitacoes/lib/distribuicaoDoTrabalho';
import {
  VISOES,
  caminhoDasAtrasadas,
  caminhoDoFiltro,
  partesPorConsulta,
  partesPorStatus,
  visaoPorId,
} from '@/features/solicitacoes/lib/distribuicaoDoTrabalho';
import type { MetricasResponse } from '@/features/solicitacoes/types/solicitacaoTypes';
import {
  rotuloDaPrioridade,
  rotuloDoStatus,
  rotuloDoTipoDeSolicitacao,
} from '@/shared/lib/rotulos';

const BASE = '/app/solicitacoes?emAberto=true';

describe('VISOES', () => {
  it('deve listar as visões na ordem status, tipo e prioridade', () => {
    // Arrange
    const esperado = ['status', 'tipo', 'prioridade'];

    // Act
    const ids = VISOES.map((visao) => visao.id);

    // Assert
    expect(ids).toEqual(esperado);
  });

  it('deve rotular as visões como Status, Tipo e Prioridade', () => {
    // Arrange
    const esperado = ['Status', 'Tipo', 'Prioridade'];

    // Act
    const rotulos = VISOES.map((visao) => visao.rotulo);

    // Assert
    expect(rotulos).toEqual(esperado);
  });

  it('deve usar o id da visão como parâmetro de URL', () => {
    // Arrange
    const esperado = VISOES.map((visao) => visao.id);

    // Act
    const parametros = VISOES.map((visao) => visao.parametro);

    // Assert
    expect(parametros).toEqual(esperado);
  });

  it('deve ter só os status em aberto na ordem do fluxo', () => {
    // Arrange
    const esperado = ['A_FAZER', 'EM_ANDAMENTO', 'EM_VALIDACAO'];

    // Act
    const valores = visaoPorId('status').partes.map((parte) => parte.valor);

    // Assert
    expect(valores).toEqual(esperado);
  });

  it('deve excluir CONCLUIDA e CANCELADA da visão status', () => {
    // Arrange
    const encerrados = ['CONCLUIDA', 'CANCELADA'];

    // Act
    const valores = visaoPorId('status').partes.map((parte) => parte.valor);

    // Assert
    expect(valores.filter((valor) => encerrados.includes(valor))).toEqual([]);
  });

  it('deve ter os quatro tipos na ordem do domínio', () => {
    // Arrange
    const esperado = ['REPARO', 'INSPECAO', 'REENGENHARIA', 'CRIACAO'];

    // Act
    const valores = visaoPorId('tipo').partes.map((parte) => parte.valor);

    // Assert
    expect(valores).toEqual(esperado);
  });

  it('deve ter as quatro prioridades da mais à menos urgente', () => {
    // Arrange
    const esperado = ['URGENTE', 'ALTA', 'MEDIA', 'BAIXA'];

    // Act
    const valores = visaoPorId('prioridade').partes.map((parte) => parte.valor);

    // Assert
    expect(valores).toEqual(esperado);
  });

  it.each([
    ['status', rotuloDoStatus],
    ['tipo', rotuloDoTipoDeSolicitacao],
    ['prioridade', rotuloDaPrioridade],
  ] as const)(
    'deve tirar o rótulo de cada parte da visão %s da tabela de rótulos',
    (id, tabela) => {
      // Arrange
      const porValor: Record<string, string> = tabela;

      // Act
      const partes = visaoPorId(id).partes;

      // Assert
      expect(partes.map((parte) => parte.rotulo)).toEqual(
        partes.map((parte) => porValor[parte.valor]),
      );
    },
  );
});

describe('visaoPorId', () => {
  it.each(['status', 'tipo', 'prioridade'] as const)(
    'deve devolver a visão certa quando o id é %s',
    (id) => {
      // Arrange
      const esperada = VISOES.find((visao) => visao.id === id);

      // Act
      const visao = visaoPorId(id);

      // Assert
      expect(visao).toBe(esperada);
    },
  );

  it('deve lançar erro com o id recebido quando a visão é desconhecida', () => {
    // Arrange
    const idInvalido = 'situacao' as VisaoDaDistribuicao;

    // Act
    const chamada = () => visaoPorId(idInvalido);

    // Assert
    expect(chamada).toThrow('Visão desconhecida: "situacao"');
  });
});

describe('caminhoDoFiltro', () => {
  it.each(['status', 'tipo', 'prioridade'] as const)(
    'deve montar o caminho com o parâmetro da visão %s',
    (id) => {
      // Arrange
      const parte = visaoPorId(id).partes[0];

      // Act
      const caminho = caminhoDoFiltro(id, parte.valor);

      // Assert
      expect(caminho).toBe(`${BASE}&${id}=${parte.valor}`);
    },
  );

  it('deve codificar o valor quando tem caractere especial', () => {
    // Arrange
    const valor = 'A&B=C d';

    // Act
    const caminho = caminhoDoFiltro('tipo', valor);

    // Assert
    expect(caminho).toBe(`${BASE}&tipo=${encodeURIComponent(valor)}`);
  });
});

const METRICAS_POR_STATUS: MetricasResponse = {
  totalUsuarios: 3,
  totalModelos: 2,
  totalSolicitacoes: 47,
  solicitacoesAbertas: 7,
  solicitacoesPendentes: 5,
  solicitacoesConcluidas: 30,
  tempoMedioResolucaoSegundos: 100,
  solicitacoesPorStatus: {
    A_FAZER: 5,
    EM_ANDAMENTO: 0,
    EM_VALIDACAO: 2,
    CONCLUIDA: 30,
    CANCELADA: 10,
  },
};

describe('partesPorStatus', () => {
  it('deve devolver indefinido quando as métricas não existem', () => {
    // Arrange
    const metricas = undefined;

    // Act
    const partes = partesPorStatus(metricas);

    // Assert
    expect(partes).toBeUndefined();
  });

  it('deve devolver só os status em aberto com suas quantidades quando as métricas existem', () => {
    // Arrange
    const metricas = METRICAS_POR_STATUS;

    // Act
    const partes = partesPorStatus(metricas);

    // Assert
    expect(partes).toEqual([
      { valor: 'A_FAZER', rotulo: rotuloDoStatus.A_FAZER, quantidade: 5 },
      { valor: 'EM_ANDAMENTO', rotulo: rotuloDoStatus.EM_ANDAMENTO, quantidade: 0 },
      { valor: 'EM_VALIDACAO', rotulo: rotuloDoStatus.EM_VALIDACAO, quantidade: 2 },
    ]);
  });
});

describe('partesPorConsulta', () => {
  const PARTES = [
    { valor: 'REPARO', rotulo: 'Reparo' },
    { valor: 'INSPECAO', rotulo: 'Inspeção' },
  ];

  it('deve juntar cada parte à sua quantidade quando todos os totais chegaram', () => {
    // Arrange
    const totais = [4, 0];

    // Act
    const partes = partesPorConsulta(PARTES, totais);

    // Assert
    expect(partes).toEqual([
      { valor: 'REPARO', rotulo: 'Reparo', quantidade: 4 },
      { valor: 'INSPECAO', rotulo: 'Inspeção', quantidade: 0 },
    ]);
  });

  it('deve devolver indefinido quando falta o total de uma parte', () => {
    // Arrange
    const totais = [4, undefined];

    // Act
    const partes = partesPorConsulta(PARTES, totais);

    // Assert
    expect(partes).toBeUndefined();
  });

  it('deve devolver indefinido quando nenhum total chegou', () => {
    // Arrange
    const totais: Array<number | undefined> = [];

    // Act
    const partes = partesPorConsulta(PARTES, totais);

    // Assert
    expect(partes).toBeUndefined();
  });
});

describe('caminhoDasAtrasadas', () => {
  it('deve devolver o caminho das atrasadas em aberto', () => {
    // Arrange
    const esperado = '/app/solicitacoes?atrasada=true&emAberto=true';

    // Act
    const caminho = caminhoDasAtrasadas();

    // Assert
    expect(caminho).toBe(esperado);
  });
});
