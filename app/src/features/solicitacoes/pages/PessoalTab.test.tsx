/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { PessoalTab } from './PessoalTab';

vi.mock('@/features/auth/hooks/usePerfil', () => ({
  usePerfil: vi.fn(),
}));
vi.mock('../hooks/useKanbanSolicitacoes', () => ({
  useKanbanSolicitacoes: vi.fn(),
}));

afterEach(cleanup);

const solicitacao = (over: Record<string, unknown>) => ({
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

describe('PessoalTab', () => {
  it('renders loading state', async () => {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    const { useKanbanSolicitacoes } = await import('../hooks/useKanbanSolicitacoes');
    vi.mocked(usePerfil).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof usePerfil>);
    vi.mocked(useKanbanSolicitacoes).mockReturnValue({
      data: [],
      isLoading: true,
    } as unknown as ReturnType<typeof useKanbanSolicitacoes>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<PessoalTab />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('renders personal solicitations filtered by user', async () => {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    const { useKanbanSolicitacoes } = await import('../hooks/useKanbanSolicitacoes');
    vi.mocked(usePerfil).mockReturnValue({
      data: { id: 'u1' },
      isLoading: false,
    } as unknown as ReturnType<typeof usePerfil>);
    vi.mocked(useKanbanSolicitacoes).mockReturnValue({
      data: [
        solicitacao({ id: 's1', titulo: 'Aberta por mim', abertaPorUsuarioId: 'u1' }),
        solicitacao({ id: 's2', titulo: 'Sob minha resp', abertaPorUsuarioId: 'u9', responsavelIds: ['u1'] }),
        solicitacao({ id: 's3', titulo: 'Concluida minha', status: 'CONCLUIDA', responsavelIds: ['u1'] }),
        solicitacao({ id: 's4', titulo: 'De outro', abertaPorUsuarioId: 'u9' }),
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useKanbanSolicitacoes>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<PessoalTab />, { wrapper: AppWrapper });
    expect(within(container).getByText('Aberta por mim')).toBeDefined();
    expect(within(container).getByText('Sob minha resp')).toBeDefined();
    expect(within(container).queryByText('De outro')).toBeNull();
  });
});
