/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { PessoalTab } from '@/features/solicitacoes/pages/PessoalTab';
import type { PageResponse } from '@/shared/types/page';
import type { Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';

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
  it('renders loading state', async () => {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    vi.mocked(usePerfil).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof usePerfil>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<PessoalTab />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('renders personal solicitations filtered by user', async () => {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    const { solicitacoesApi } = await import('@/features/solicitacoes/api/solicitacoesApi');
    vi.mocked(usePerfil).mockReturnValue({
      data: { id: 'u1' },
      isLoading: false,
    } as unknown as ReturnType<typeof usePerfil>);

    const minhasPage = {
      ...emptyPage,
      totalElements: 2,
      content: [
        solicitacao({ id: 's1', titulo: 'Aberta por mim', abertaPorUsuarioId: 'u1' }),
        solicitacao({ id: 's4', titulo: 'De outro', abertaPorUsuarioId: 'u9' }),
      ],
    };
    const responsavelPage = {
      ...emptyPage,
      totalElements: 2,
      content: [
        solicitacao({ id: 's2', titulo: 'Sob minha resp', abertaPorUsuarioId: 'u9', responsavelIds: ['u1'] }),
        solicitacao({ id: 's3', titulo: 'Concluida minha', status: 'CONCLUIDA', responsavelIds: ['u1'] }),
      ],
    };

    vi.mocked(solicitacoesApi.listar).mockImplementation((filters) => {
      if (filters.abertaPorUsuarioId && filters.status === 'CONCLUIDA') {
        return Promise.resolve({ ...emptyPage, totalElements: 0 });
      }
      if (filters.abertaPorUsuarioId && filters.status === 'CANCELADA') {
        return Promise.resolve({ ...emptyPage, totalElements: 0 });
      }
      if (filters.abertaPorUsuarioId) {
        return Promise.resolve(minhasPage);
      }
      if (filters.responsavelId && filters.status === 'CONCLUIDA') {
        return Promise.resolve({ ...emptyPage, totalElements: 1 });
      }
      if (filters.responsavelId && filters.status === 'CANCELADA') {
        return Promise.resolve({ ...emptyPage, totalElements: 0 });
      }
      return Promise.resolve(responsavelPage);
    });

    const { AppWrapper } = createAppWrapper();
    const { findByText, getAllByText } = render(<PessoalTab />, { wrapper: AppWrapper });

    expect(await findByText('Aberta por mim')).toBeDefined();
    expect(await findByText('Sob minha resp')).toBeDefined();
    // "Abertas por mim": totalElements (2) - concluidas (0) - canceladas (0) = 2
    expect(getAllByText('2').length).toBeGreaterThan(0);
    // "Concluídas por mim": vem direto da contagem por status (1), não do array truncado
    expect(getAllByText('1').length).toBeGreaterThan(0);
  });
});

describe('PessoalTab — o que o operador abriu', () => {
  const EU = 'op-1';

  // O operador abriu 5: 3 em aberto (só 1 atribuída a ele) e 2 concluídas, nenhuma com ele.
  const abertasPorMim = [
    solicitacao({ id: 'a1', titulo: 'Abri e está comigo', abertaPorUsuarioId: EU, responsavelIds: [EU] }),
    solicitacao({ id: 'a2', titulo: 'Abri e está com outro', abertaPorUsuarioId: EU, responsavelIds: ['op-2'] }),
    solicitacao({ id: 'a3', titulo: 'Abri e ninguém pegou', abertaPorUsuarioId: EU }),
    solicitacao({ id: 'a4', titulo: 'Abri e concluíram', abertaPorUsuarioId: EU, status: 'CONCLUIDA' }),
    solicitacao({ id: 'a5', titulo: 'Abri e concluíram também', abertaPorUsuarioId: EU, status: 'CONCLUIDA' }),
  ];

  async function abrirAba() {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    const { solicitacoesApi } = await import('@/features/solicitacoes/api/solicitacoesApi');
    vi.mocked(usePerfil).mockReturnValue({
      data: { id: EU },
      isLoading: false,
    } as unknown as ReturnType<typeof usePerfil>);
    vi.mocked(solicitacoesApi.listar).mockReset();
    vi.mocked(solicitacoesApi.listar).mockImplementation((filters) => {
      if (filters.abertaPorUsuarioId && filters.status === 'CONCLUIDA') {
        return Promise.resolve({ ...emptyPage, totalElements: 2 });
      }
      if (filters.abertaPorUsuarioId && filters.status) {
        return Promise.resolve({ ...emptyPage, totalElements: 0 });
      }
      if (filters.abertaPorUsuarioId) {
        return Promise.resolve({ ...emptyPage, totalElements: 5, content: abertasPorMim });
      }
      if (filters.status) return Promise.resolve({ ...emptyPage, totalElements: 0 });
      return Promise.resolve({ ...emptyPage, totalElements: 1, content: [abertasPorMim[0]] });
    });
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    const tela = render(<PessoalTab />, { wrapper: AppWrapper });
    await tela.findByText('Minhas solicitações abertas');
    return { tela, listar: vi.mocked(solicitacoesApi.listar) };
  }

  function listaAbertasPorMim(tela: Awaited<ReturnType<typeof abrirAba>>['tela']) {
    const secao = tela.getByText('Minhas solicitações abertas').parentElement as HTMLElement;
    return within(secao);
  }

  it.each([['Abri e está comigo'], ['Abri e está com outro'], ['Abri e ninguém pegou']])(
    'deve listar em "abertas por mim" a solicitação em aberto "%s"',
    async (titulo) => {
      // Act
      const { tela } = await abrirAba();

      // Assert
      expect(listaAbertasPorMim(tela).getByText(titulo)).toBeDefined();
    },
  );

  it('deve deixar fora de "abertas por mim" as solicitações que o operador abriu e já foram concluídas', async () => {
    // Act
    const { tela } = await abrirAba();

    // Assert
    expect(listaAbertasPorMim(tela).queryByText('Abri e concluíram')).toBeNull();
  });

  it('deve contar em "Abertas por mim" tudo o que o operador abriu menos as concluídas e canceladas', async () => {
    // Act
    const { tela } = await abrirAba();

    // Assert
    const cartao = tela.getByText('Abertas por mim').closest('div.relative') as HTMLElement;
    expect(within(cartao).getByText('3')).toBeDefined();
  });

  it.each([[undefined], ['CONCLUIDA'], ['CANCELADA']])(
    'deve consultar o que o operador abriu com status %s sem restringir por responsável',
    async (status) => {
      // Act
      const { listar } = await abrirAba();

      // Assert
      const consultas = listar.mock.calls
        .map(([filtros]) => filtros)
        .filter((filtros) => filtros.abertaPorUsuarioId === EU && filtros.status === status);
      expect(consultas).toHaveLength(1);
      expect(consultas[0].responsavelId).toBeUndefined();
    },
  );
});
