import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { httpClient } from '@/shared/api/httpClient';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';

let get: MockInstance<typeof httpClient.get>;
let post: MockInstance<typeof httpClient.post>;
let put: MockInstance<typeof httpClient.put>;
let patch: MockInstance<typeof httpClient.patch>;

beforeEach(() => {
  get = vi.spyOn(httpClient, 'get').mockResolvedValue({});
  post = vi.spyOn(httpClient, 'post').mockResolvedValue({});
  put = vi.spyOn(httpClient, 'put').mockResolvedValue({});
  patch = vi.spyOn(httpClient, 'patch').mockResolvedValue({});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('solicitacoesApi.obterPainel', () => {
  it('deve chamar o painel por período com os dias quando o modelo não é dado', async () => {
    // Arrange
    const dias = 30;

    // Act
    await solicitacoesApi.obterPainel(dias);

    // Assert
    expect(get).toHaveBeenCalledExactlyOnceWith('/solicitacoes/metricas/painel', {
      params: { dias: 30 },
    });
  });

  it('deve incluir o modelo na consulta quando o modelo é dado', async () => {
    // Arrange
    const modeloId = 'modelo-1';

    // Act
    await solicitacoesApi.obterPainel(7, modeloId);

    // Assert
    expect(get).toHaveBeenCalledExactlyOnceWith('/solicitacoes/metricas/painel', {
      params: { dias: 7, modeloId: 'modelo-1' },
    });
  });

  it('deve devolver a resposta do servidor quando a chamada termina', async () => {
    // Arrange
    const painel = { periodo: { criadas: 3 } };
    get.mockResolvedValue(painel);

    // Act
    const resposta = await solicitacoesApi.obterPainel(90);

    // Assert
    expect(resposta).toBe(painel);
  });
});

describe('solicitacoesApi — leituras', () => {
  const filtros = { status: 'A_FAZER' as const, page: 0, size: 20 };

  it.each([
    {
      nome: 'listar',
      chamar: () => solicitacoesApi.listar(filtros),
      caminho: '/solicitacoes',
      opcoes: { params: filtros },
    },
    {
      nome: 'buscarPorId',
      chamar: () => solicitacoesApi.buscarPorId('s1'),
      caminho: '/solicitacoes/s1',
      opcoes: undefined,
    },
    {
      nome: 'listarAtividades',
      chamar: () => solicitacoesApi.listarAtividades('s1'),
      caminho: '/solicitacoes/s1/atividades',
      opcoes: undefined,
    },
    {
      nome: 'obterMetricas',
      chamar: () => solicitacoesApi.obterMetricas(),
      caminho: '/solicitacoes/metricas',
      opcoes: undefined,
    },
    {
      nome: 'obterHistoricoMetricas',
      chamar: () => solicitacoesApi.obterHistoricoMetricas(30, 'm1'),
      caminho: '/solicitacoes/metricas/historico',
      opcoes: { params: { dias: 30, modeloId: 'm1' } },
    },
    {
      nome: 'exportar',
      chamar: () => solicitacoesApi.exportar(filtros),
      caminho: '/solicitacoes/relatorio',
      opcoes: { params: filtros },
    },
    {
      nome: 'obterMetricasPorModelo',
      chamar: () =>
        solicitacoesApi.obterMetricasPorModelo({
          sort: 'TEMPO_RESOLUCAO',
          dir: 'desc',
          page: 0,
          size: 10,
        }),
      caminho: '/solicitacoes/metricas/por-modelo',
      opcoes: { params: { sort: 'TEMPO_RESOLUCAO', dir: 'desc', page: 0, size: 10 } },
    },
    {
      nome: 'exportarMetricasPorModeloPdf',
      chamar: () => solicitacoesApi.exportarMetricasPorModeloPdf({ sort: 'INTERVALO', dir: 'asc' }),
      caminho: '/solicitacoes/metricas/por-modelo/pdf',
      opcoes: { params: { sort: 'INTERVALO', dir: 'asc' } },
    },
  ])('deve ler $caminho quando $nome é chamada', async ({ chamar, caminho, opcoes }) => {
    // Act
    await chamar();

    // Assert
    const chamada = opcoes === undefined ? [caminho] : [caminho, opcoes];
    expect(get).toHaveBeenCalledExactlyOnceWith(...chamada);
  });
});

describe('solicitacoesApi — escritas', () => {
  it('deve abrir a solicitação por POST quando abrir é chamada', async () => {
    // Arrange
    const dados = { titulo: 'T' } as Parameters<typeof solicitacoesApi.abrir>[0];

    // Act
    await solicitacoesApi.abrir(dados);

    // Assert
    expect(post).toHaveBeenCalledExactlyOnceWith('/solicitacoes', dados);
  });

  it('deve registrar o comentário por POST quando comentar é chamada', async () => {
    // Act
    await solicitacoesApi.comentar('s1', { comentario: 'ok' });

    // Assert
    expect(post).toHaveBeenCalledExactlyOnceWith('/solicitacoes/s1/comentarios', {
      comentario: 'ok',
    });
  });

  it('deve editar por PUT quando editar é chamada', async () => {
    // Act
    await solicitacoesApi.editar('s1', { titulo: 'T', descricao: 'D' });

    // Assert
    expect(put).toHaveBeenCalledExactlyOnceWith('/solicitacoes/s1', {
      titulo: 'T',
      descricao: 'D',
    });
  });

  it.each([
    {
      nome: 'triar',
      rota: 'triar',
      chamar: () =>
        solicitacoesApi.triar('s1', { prioridade: 'ALTA', responsavelIds: [], descricao: 'D' }),
    },
    {
      nome: 'enviarParaValidacao',
      rota: 'enviar-validacao',
      chamar: () => solicitacoesApi.enviarParaValidacao('s1', { comentario: 'c' }),
    },
    {
      nome: 'encerrar',
      rota: 'encerrar',
      chamar: () => solicitacoesApi.encerrar('s1', { concluir: true, comentario: 'c' } as never),
    },
    {
      nome: 'cancelar',
      rota: 'cancelar',
      chamar: () => solicitacoesApi.cancelar('s1', { motivo: 'm' }),
    },
    {
      nome: 'devolver',
      rota: 'devolver',
      chamar: () => solicitacoesApi.devolver('s1', { motivo: 'm' }),
    },
    {
      nome: 'alterarResponsaveis',
      rota: 'responsaveis',
      chamar: () => solicitacoesApi.alterarResponsaveis('s1', { responsavelIds: ['u1'] }),
    },
  ])(
    'deve chamar PATCH em /solicitacoes/s1/$rota quando $nome é chamada',
    async ({ rota, chamar }) => {
      // Act
      await chamar();

      // Assert
      expect(patch).toHaveBeenCalledTimes(1);
      expect(patch.mock.calls[0][0]).toBe(`/solicitacoes/s1/${rota}`);
    },
  );
});
