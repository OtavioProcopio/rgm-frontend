/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { ModeloDetalhePage } from '@/features/admin/modelos/pages/ModeloDetalhePage';

vi.mock('@/features/admin/modelos/api/modelosApi', () => ({
  modelosApi: {
    exportarFicha: vi.fn().mockResolvedValue(new Blob()),
  },
}));

vi.mock('@/features/admin/modelos/hooks/useModelo', () => ({
  useModelo: vi.fn().mockReturnValue({ data: undefined, isLoading: true, error: null }),
}));
vi.mock('@/features/admin/modelos/hooks/useEventosModelo', () => ({
  useEventosModelo: vi.fn().mockReturnValue({ data: [] }),
}));
vi.mock('@/features/solicitacoes/hooks/useSolicitacoes', () => ({
  useSolicitacoes: vi.fn().mockReturnValue({ data: undefined }),
}));
vi.mock('@/features/admin/modelos/hooks/useDesativarModelo', () => ({
  useDesativarModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/admin/modelos/hooks/useAtivarModelo', () => ({
  useAtivarModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/admin/modelos/components/EventosModeloList', () => ({
  EventosModeloList: () => <div />,
}));
vi.mock('@/features/admin/modelos/components/GaleriaModelo', () => ({
  GaleriaModelo: () => <div data-testid="galeria-modelo" />,
}));

afterEach(cleanup);

const modelo = {
  id: '1',
  codigo: 'M01',
  versao: 1,
  descricao: 'Molde',
  observacoes: null,
  fotoCapaUrl: null,
  ativo: true,
  maquina: 'Prensa PH-200',
  temPendenciaAberta: false,
  criadoEm: '2026-01-01T00:00:00Z',
  atualizadoEm: '2026-01-01T00:00:00Z',
};

const solicitacaoConcluida = (over: Record<string, unknown>) => ({
  id: 's1',
  titulo: 'Reparo',
  descricao: '',
  tipo: 'REPARO',
  status: 'CONCLUIDA',
  prioridade: 'MEDIA',
  modeloId: '1',
  abertaPorUsuarioId: 'u1',
  comentarioFinal: null,
  atualizadaEm: '2026-01-01T00:00:00Z',
  canceladaEm: null,
  responsavelIds: [],
  ...over,
});

describe('ModeloDetalhePage (admin)', () => {
  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1'] });
    const { container } = render(<ModeloDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('shows error state', async () => {
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Erro'),
    } as ReturnType<typeof useModelo>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1'] });
    const { container } = render(<ModeloDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível/i)).toBeDefined();
  });

  it('computes time metrics client-side when there are 2+ concluidas', async () => {
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: modelo,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useModelo>);

    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: {
        content: [
          solicitacaoConcluida({
            id: 's1',
            criadaEm: '2026-01-01T00:00:00Z',
            concluidaEm: '2026-01-01T01:00:00Z',
          }),
          solicitacaoConcluida({
            id: 's2',
            criadaEm: '2026-01-03T00:00:00Z',
            concluidaEm: '2026-01-03T02:00:00Z',
          }),
        ],
        totalElements: 2,
      },
    } as unknown as ReturnType<typeof useSolicitacoes>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1'] });
    const { container } = render(<ModeloDetalhePage />, { wrapper: AppWrapper });

    expect(within(container).getByText('Tempo médio de resolução')).toBeDefined();
    expect(within(container).getByText('2h')).toBeDefined();
    expect(within(container).getByText('Intervalo médio entre solicitações')).toBeDefined();
    expect(within(container).getByText('2d 0h')).toBeDefined();
  });

  it('shows placeholder when fewer than 2 concluidas', async () => {
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: modelo,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useModelo>);

    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: {
        content: [
          solicitacaoConcluida({
            id: 's1',
            criadaEm: '2026-01-01T00:00:00Z',
            concluidaEm: '2026-01-01T01:00:00Z',
          }),
        ],
        totalElements: 1,
      },
    } as unknown as ReturnType<typeof useSolicitacoes>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1'] });
    const { container } = render(<ModeloDetalhePage />, { wrapper: AppWrapper });

    const kpiCards = within(container).getAllByText('—');
    expect(kpiCards.length).toBe(2);
  });
});

describe('ModeloDetalhePage (admin) — confirmações', () => {
  /** Abre o detalhe do modelo, ativo ou inativo, como administrador. */
  async function abrirDetalhe(ativo: boolean) {
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: { ...modelo, ativo },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useModelo>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1'] });
    render(
      <Routes>
        <Route path="/modelos/:id" element={<ModeloDetalhePage />} />
      </Routes>,
      { wrapper: AppWrapper },
    );
  }

  it.each([
    [true, 'Desativar', 'Desativar modelo'],
    [false, 'Ativar', 'Ativar modelo'],
  ])(
    'deve abrir a confirmação como diálogo modal com o foco em Cancelar quando o modelo ativo=%s e o botão é %s',
    async (ativo, botao, titulo) => {
      // Arrange
      await abrirDetalhe(ativo);

      // Act
      await userEvent.click(screen.getByRole('button', { name: botao }));

      // Assert
      const dialogo = screen.getByRole('dialog', { name: titulo });
      expect(dialogo.getAttribute('aria-modal')).toBe('true');
      expect(document.activeElement).toBe(
        within(dialogo).getByRole('button', { name: 'Cancelar' }),
      );
    },
  );

  it('deve fechar a confirmação e devolver o foco ao botão quando Esc é apertado', async () => {
    // Arrange
    await abrirDetalhe(true);
    await userEvent.click(screen.getByRole('button', { name: 'Desativar' }));

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Desativar' }));
  });
});
