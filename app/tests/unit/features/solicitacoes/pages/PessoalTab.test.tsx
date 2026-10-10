/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { PessoalTab } from '@/features/solicitacoes/pages/PessoalTab';
import type { PageResponse } from '@/shared/types/page';
import type {
  Solicitacao,
  SolicitacoesFilters,
} from '@/features/solicitacoes/types/solicitacaoTypes';

vi.mock('@/features/auth/hooks/usePerfil', () => ({
  usePerfil: vi.fn(),
}));
vi.mock('@/features/solicitacoes/api/solicitacoesApi', () => ({
  solicitacoesApi: {
    listar: vi.fn(),
  },
}));

afterEach(cleanup);

const solicitacao = (over: Partial<Solicitacao>): Solicitacao => ({
  id: 's1',
  titulo: 'Chamado',
  descricao: '',
  tipo: 'REPARO',
  status: 'A_FAZER',
  prioridade: 'ALTA',
  modeloId: 'm1',
  abertaPorUsuarioId: 'u1',
  comentarioFinal: null,
  criadaEm: '2026-01-01T00:00:00Z',
  atualizadaEm: '2026-01-01T00:00:00Z',
  concluidaEm: null,
  canceladaEm: null,
  responsavelIds: [],
  ...over,
});

const emptyPage: PageResponse<Solicitacao> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 100,
};

describe('PessoalTab', () => {
  it('deve mostrar o carregamento enquanto o perfil não chegou', async () => {
    // Arrange
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    vi.mocked(usePerfil).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof usePerfil>);
    const { AppWrapper } = createAppWrapper();

    // Act
    const { container } = render(<PessoalTab />, { wrapper: AppWrapper });

    // Assert
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });
});

describe('PessoalTab — aba sem nada', () => {
  async function abrir(totais: { abertas: number; responsavel: number; concluidas: number }) {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    const { solicitacoesApi } = await import('@/features/solicitacoes/api/solicitacoesApi');
    vi.mocked(usePerfil).mockReturnValue({
      data: { id: 'op-1' },
      isLoading: false,
    } as unknown as ReturnType<typeof usePerfil>);
    vi.mocked(solicitacoesApi.listar).mockReset();
    vi.mocked(solicitacoesApi.listar).mockImplementation((filtros) => {
      if (filtros.status === 'CONCLUIDA') {
        return Promise.resolve({ ...emptyPage, totalElements: totais.concluidas });
      }
      const total = filtros.abertaPorUsuarioId ? totais.abertas : totais.responsavel;
      const content = Array.from({ length: total }, (_, i) =>
        solicitacao({ id: `x-${i}`, titulo: `Item ${i}` }),
      );
      return Promise.resolve({
        ...emptyPage,
        content,
        totalElements: total,
        totalPages: total > 0 ? 1 : 0,
      });
    });
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    return render(<PessoalTab />, { wrapper: AppWrapper });
  }

  const zerado = { abertas: 0, responsavel: 0, concluidas: 0 };

  it('deve mostrar o título "Nada por aqui ainda" quando tudo está zerado', async () => {
    // Arrange
    const totais = zerado;

    // Act
    const tela = await abrir(totais);

    // Assert
    expect(await tela.findByText('Nada por aqui ainda')).toBeDefined();
  });

  it('deve mostrar a descrição do vazio quando tudo está zerado', async () => {
    // Arrange
    const totais = zerado;

    // Act
    const tela = await abrir(totais);

    // Assert
    expect(await tela.findByText('Você ainda não abriu nem recebeu solicitações.')).toBeDefined();
  });

  it('deve levar o link "Ver o quadro" para /app/solicitacoes quando tudo está zerado', async () => {
    // Arrange
    const totais = zerado;

    // Act
    const tela = await abrir(totais);
    const link = await tela.findByRole('link', { name: 'Ver o quadro' });

    // Assert
    expect(link.getAttribute('href')).toBe('/app/solicitacoes');
  });

  it.each(['Abertas por mim', 'Sou responsável', 'Nenhuma solicitação encontrada'])(
    'deve não mostrar "%s" quando tudo está zerado',
    async (texto) => {
      // Arrange
      const totais = zerado;

      // Act
      const tela = await abrir(totais);
      await tela.findByText('Nada por aqui ainda');

      // Assert
      expect(tela.queryByText(new RegExp(texto))).toBeNull();
    },
  );

  it('deve mostrar os indicadores quando só há uma concluída', async () => {
    // Arrange
    const totais = { ...zerado, concluidas: 1 };

    // Act
    const tela = await abrir(totais);

    // Assert
    expect(await tela.findByText('Concluídas por mim')).toBeDefined();
  });

  it('deve não mostrar o vazio quando só há uma concluída', async () => {
    // Arrange
    const totais = { ...zerado, concluidas: 1 };

    // Act
    const tela = await abrir(totais);
    await tela.findByText('Concluídas por mim');

    // Assert
    expect(tela.queryByText('Nada por aqui ainda')).toBeNull();
  });

  it('deve mostrar a lista quando há uma aberta por mim', async () => {
    // Arrange
    const totais = { ...zerado, abertas: 1 };

    // Act
    const tela = await abrir(totais);

    // Assert
    expect(await tela.findByRole('link', { name: /Item 0/ })).toBeDefined();
  });

  it('deve mostrar o indicador "Abertas por mim" quando há uma aberta por mim', async () => {
    // Arrange
    const totais = { ...zerado, abertas: 1 };

    // Act
    const tela = await abrir(totais);

    // Assert
    expect(await tela.findByText('Abertas por mim')).toBeDefined();
  });

  it('deve mostrar as listas vazias quando a consulta das abertas falha e há concluídas', async () => {
    // Arrange
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    const { solicitacoesApi } = await import('@/features/solicitacoes/api/solicitacoesApi');
    vi.mocked(usePerfil).mockReturnValue({
      data: { id: 'op-1' },
      isLoading: false,
    } as unknown as ReturnType<typeof usePerfil>);
    vi.mocked(solicitacoesApi.listar).mockReset();
    vi.mocked(solicitacoesApi.listar).mockImplementation((filtros) =>
      filtros.status === 'CONCLUIDA'
        ? Promise.resolve({ ...emptyPage, totalElements: 5 })
        : Promise.reject(new Error('falha')),
    );
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    // Act
    const tela = render(<PessoalTab />, { wrapper: AppWrapper });

    // Assert
    expect(await tela.findAllByText(/Nenhuma solicitação encontrada/)).toHaveLength(2);
  });

  async function abrirComConsultaQueFalha(
    falha: (filtros: SolicitacoesFilters) => boolean,
    abertasPorMim: number,
  ) {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    const { solicitacoesApi } = await import('@/features/solicitacoes/api/solicitacoesApi');
    vi.mocked(usePerfil).mockReturnValue({
      data: { id: 'op-1' },
      isLoading: false,
    } as unknown as ReturnType<typeof usePerfil>);
    vi.mocked(solicitacoesApi.listar).mockReset();
    vi.mocked(solicitacoesApi.listar).mockImplementation((filtros) =>
      falha(filtros)
        ? Promise.reject(new Error('falha'))
        : Promise.resolve({
            ...emptyPage,
            content: filtros.abertaPorUsuarioId
              ? Array.from({ length: abertasPorMim }, (_, i) =>
                  solicitacao({ id: `a${i}`, titulo: `Minha ${i}` }),
                )
              : [],
            totalElements: filtros.abertaPorUsuarioId ? abertasPorMim : 0,
            totalPages: filtros.abertaPorUsuarioId && abertasPorMim > 0 ? 1 : 0,
          }),
    );
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    return render(<PessoalTab />, { wrapper: AppWrapper });
  }

  it('deve mostrar o vazio quando a consulta das concluídas falha e não há abertas', async () => {
    // Arrange
    const abertasPorMim = 0;

    // Act
    const tela = await abrirComConsultaQueFalha(
      (filtros) => filtros.status === 'CONCLUIDA',
      abertasPorMim,
    );

    // Assert
    expect(await tela.findByText('Nada por aqui ainda')).toBeDefined();
  });

  it('deve mostrar os indicadores quando a consulta das concluídas falha e há abertas', async () => {
    // Arrange
    const abertasPorMim = 2;

    // Act
    const tela = await abrirComConsultaQueFalha(
      (filtros) => filtros.status === 'CONCLUIDA',
      abertasPorMim,
    );

    // Assert
    expect(await tela.findByText('Concluídas por mim')).toBeDefined();
  });

  it('deve não mostrar o vazio quando o perfil ainda carrega', async () => {
    // Arrange
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    vi.mocked(usePerfil).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof usePerfil>);
    const { AppWrapper } = createAppWrapper();

    // Act
    const tela = render(<PessoalTab />, { wrapper: AppWrapper });

    // Assert
    expect(tela.queryByText('Nada por aqui ainda')).toBeNull();
  });
});

describe('PessoalTab — listas em aberto, paginadas', () => {
  const EU = 'op-1';
  const OUTRO = 'op-2';

  const minhas: Solicitacao[] = [];
  const comigo: Solicitacao[] = [];
  let clienteAtual: ReturnType<typeof createAppWrapper>['queryClient'];
  const queryClient = () => clienteAtual;

  beforeEach(() => {
    minhas.length = 0;
    comigo.length = 0;
    for (let i = 0; i < 25; i += 1) {
      minhas.push(
        solicitacao({
          id: `a-${i}`,
          titulo: `Abri ${String(i + 1).padStart(2, '0')}`,
          abertaPorUsuarioId: EU,
          responsavelIds: i % 2 ? [OUTRO] : [],
        }),
      );
    }
    for (let i = 0; i < 13; i += 1) {
      comigo.push(
        solicitacao({
          id: `r-${i}`,
          titulo: `Comigo ${String(i + 1).padStart(2, '0')}`,
          abertaPorUsuarioId: OUTRO,
          status: 'EM_ANDAMENTO',
          responsavelIds: [EU],
        }),
      );
    }
  });

  const pagina = (itens: Solicitacao[], page: number, size: number): PageResponse<Solicitacao> => ({
    content: itens.slice(page * size, page * size + size),
    page,
    size,
    totalElements: itens.length,
    totalPages: Math.ceil(itens.length / size),
  });

  async function abrirAba() {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    const { solicitacoesApi } = await import('@/features/solicitacoes/api/solicitacoesApi');
    vi.mocked(usePerfil).mockReturnValue({
      data: { id: EU },
      isLoading: false,
    } as unknown as ReturnType<typeof usePerfil>);
    vi.mocked(solicitacoesApi.listar).mockReset();
    vi.mocked(solicitacoesApi.listar).mockImplementation((filtros) => {
      if (filtros.status === 'CONCLUIDA') {
        return Promise.resolve({ ...emptyPage, totalElements: 7 });
      }
      if (filtros.abertaPorUsuarioId)
        return Promise.resolve(pagina(minhas, filtros.page, filtros.size));
      return Promise.resolve(pagina(comigo, filtros.page, filtros.size));
    });
    const { AppWrapper, queryClient: cliente } = createAppWrapper({
      user: { nome: 'Op', perfil: 'OPERADOR' },
    });
    clienteAtual = cliente;
    const tela = render(<PessoalTab />, { wrapper: AppWrapper });
    await tela.findByRole('heading', { name: 'Minhas solicitações abertas' });
    return { tela, listar: vi.mocked(solicitacoesApi.listar) };
  }

  const consultas = (listar: Awaited<ReturnType<typeof abrirAba>>['listar']) =>
    listar.mock.calls.map(([filtros]) => filtros);

  it('deve pedir à API as solicitações em aberto que o operador abriu, 10 por página, sem restringir por responsável', async () => {
    // Act
    const { listar } = await abrirAba();

    // Assert
    expect(consultas(listar)).toContainEqual({
      page: 0,
      size: 10,
      abertaPorUsuarioId: EU,
      emAberto: true,
    });
  });

  it('deve pedir à API as solicitações em aberto sob responsabilidade do operador, 10 por página', async () => {
    // Act
    const { listar } = await abrirAba();

    // Assert
    expect(consultas(listar)).toContainEqual({
      page: 0,
      size: 10,
      responsavelId: EU,
      emAberto: true,
    });
  });

  it('deve mostrar 10 das 25 solicitações abertas pelo operador na primeira página', async () => {
    // Act
    const { tela } = await abrirAba();

    // Assert
    expect(tela.getAllByRole('link', { name: /^Abri \d\d/ })).toHaveLength(10);
  });

  it('deve indicar 3 páginas na lista de 25 solicitações', async () => {
    // Act
    const { tela } = await abrirAba();

    // Assert
    expect(tela.getByText(/Página 1 de 3/)).toBeDefined();
  });

  it('deve não mostrar paginação na lista que cabe em uma página', async () => {
    // Arrange
    comigo.length = 3;

    // Act
    const { tela } = await abrirAba();

    // Assert
    expect(tela.getAllByRole('button', { name: 'Próxima' })).toHaveLength(1);
  });

  it('deve mostrar a segunda página das abertas pelo operador quando "Próxima" é acionado', async () => {
    // Arrange
    const { tela } = await abrirAba();

    // Act
    await userEvent.click(tela.getAllByRole('button', { name: 'Próxima' })[0]);

    // Assert
    expect(await tela.findByRole('link', { name: /Abri 11/ })).toBeDefined();
  });

  it('deve voltar à primeira página das abertas pelo operador quando "Anterior" é acionado', async () => {
    // Arrange
    const { tela } = await abrirAba();
    await userEvent.click(tela.getAllByRole('button', { name: 'Próxima' })[0]);
    await tela.findByRole('link', { name: /Abri 11/ });

    // Act
    await userEvent.click(tela.getAllByRole('button', { name: 'Anterior' })[0]);

    // Assert
    expect(await tela.findByRole('link', { name: /Abri 01/ })).toBeDefined();
  });

  it('deve pedir só a página seguinte da lista em que "Próxima" foi acionado', async () => {
    // Arrange
    const { tela, listar } = await abrirAba();
    listar.mockClear();

    // Act
    await userEvent.click(tela.getAllByRole('button', { name: 'Próxima' })[0]);
    await tela.findByRole('link', { name: /Abri 11/ });

    // Assert
    expect(consultas(listar)).toEqual([
      { page: 1, size: 10, abertaPorUsuarioId: EU, emAberto: true },
    ]);
  });

  it('deve contar em "Abertas por mim" o total em aberto que o operador abriu, e não os 10 da página', async () => {
    // Act
    const { tela } = await abrirAba();

    // Assert
    expect(tela.getByText('25')).toBeDefined();
  });

  it('deve contar em "Sou responsável" o total em aberto com o operador, e não os 10 da página', async () => {
    // Act
    const { tela } = await abrirAba();

    // Assert
    expect(tela.getByText('13')).toBeDefined();
  });

  it('deve contar em "Concluídas por mim" o total devolvido pela contagem de concluídas como responsável', async () => {
    // Act
    const { tela } = await abrirAba();

    // Assert
    expect(tela.getByText('7')).toBeDefined();
  });

  it('deve listar a solicitação que o operador abriu e está atribuída a outro', async () => {
    // Act
    const { tela } = await abrirAba();

    // Assert
    expect(tela.getByRole('link', { name: /Abri 02/ })).toBeDefined();
  });

  it.each(['Minhas solicitações abertas', 'Sob minha responsabilidade'])(
    'deve emoldurar a lista com a peça de cartão quando o título é %s',
    async (titulo) => {
      // Arrange
      const esperado = ['border-line', 'bg-surface'];

      // Act
      const { tela } = await abrirAba();
      const moldura = tela.getByRole('heading', { name: titulo }).closest('section, div');

      // Assert
      expect(moldura?.className.split(' ')).toEqual(expect.arrayContaining(esperado));
    },
  );

  it('deve mostrar o aviso de lista vazia no texto secundário quando o operador não abriu solicitação', async () => {
    // Arrange
    minhas.length = 0;

    // Act
    const { tela } = await abrirAba();
    const aviso = tela.getByText('Nenhuma solicitação encontrada.');

    // Assert
    expect(aviso.className.split(' ')).toContain('text-fg-muted');
  });

  it('deve voltar para a última página que existe quando a página aberta deixa de existir', async () => {
    // Arrange
    const { tela } = await abrirAba();
    await userEvent.click(tela.getAllByRole('button', { name: 'Próxima' })[0]);
    await userEvent.click(tela.getAllByRole('button', { name: 'Próxima' })[0]);
    await tela.findByRole('link', { name: /Abri 21/ });

    // Act
    minhas.length = 20;
    await act(() => queryClient().invalidateQueries());

    // Assert
    expect(await tela.findByRole('link', { name: /Abri 11/ })).toBeDefined();
  });

  it('deve manter a paginação visível depois de voltar da página que deixou de existir', async () => {
    // Arrange
    const { tela } = await abrirAba();
    await userEvent.click(tela.getAllByRole('button', { name: 'Próxima' })[0]);
    await userEvent.click(tela.getAllByRole('button', { name: 'Próxima' })[0]);
    await tela.findByRole('link', { name: /Abri 21/ });

    // Act
    minhas.length = 20;
    await act(() => queryClient().invalidateQueries());

    // Assert
    expect(await tela.findByText(/Página 2 de 2/)).toBeDefined();
  });
});
