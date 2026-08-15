/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { PessoalTab } from './PessoalTab';
import type { PageResponse } from '@/shared/types/page';
import type { Solicitacao } from '../types/solicitacaoTypes';

vi.mock('@/features/auth/hooks/usePerfil', () => ({
  usePerfil: vi.fn(),
}));
vi.mock('../api/solicitacoesApi', () => ({
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
    const { solicitacoesApi } = await import('../api/solicitacoesApi');
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
