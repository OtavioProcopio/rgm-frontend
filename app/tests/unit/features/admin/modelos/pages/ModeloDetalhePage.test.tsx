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
vi.mock('@/features/solicitacoes/hooks/useResumoDasSolicitacoesDoModelo', () => ({
  useResumoDasSolicitacoesDoModelo: vi.fn().mockReturnValue({ data: undefined }),
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

  async function abrirComResumo(resumo: Record<string, unknown> | undefined) {
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    const { useResumoDasSolicitacoesDoModelo } = await import(
      '@/features/solicitacoes/hooks/useResumoDasSolicitacoesDoModelo'
    );
    vi.mocked(useModelo).mockReturnValue({
      data: modelo,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useModelo>);
    vi.mocked(useSolicitacoes).mockClear();
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: { content: [], totalElements: 0 },
    } as unknown as ReturnType<typeof useSolicitacoes>);
    vi.mocked(useResumoDasSolicitacoesDoModelo).mockReturnValue({
      data: resumo,
    } as unknown as ReturnType<typeof useResumoDasSolicitacoesDoModelo>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1'] });
    const { container } = render(<ModeloDetalhePage />, { wrapper: AppWrapper });
    return { container, useSolicitacoes: vi.mocked(useSolicitacoes) };
  }

  const RESUMO = {
    total: 40,
    emAberto: 6,
    concluidas: 30,
    canceladas: 4,
    tempoMedioResolucaoSegundos: 7200,
    intervaloMedioSegundos: 172800,
  };

  it.each([
    ['Total', '40'],
    ['Abertas', '6'],
    ['Concluídas', '30'],
    ['Taxa de sucesso', '75%'],
    ['Tempo médio de resolução', '2h'],
    ['Intervalo médio entre solicitações', '2d 0h'],
  ])('deve mostrar em "%s" o valor %s vindo do resumo da API', async (rotulo, valor) => {
    // Act
    const { container } = await abrirComResumo(RESUMO);

    // Assert
    const cartao = within(container).getByText(rotulo).parentElement as HTMLElement;
    expect(within(cartao).getByText(valor)).toBeDefined();
  });

  it('deve mostrar "—" nos dois tempos quando o resumo não traz tempo', async () => {
    // Act
    const { container } = await abrirComResumo({
      ...RESUMO,
      tempoMedioResolucaoSegundos: null,
      intervaloMedioSegundos: null,
    });

    // Assert
    expect(within(container).getAllByText('—')).toHaveLength(2);
  });

  it('deve mostrar taxa de sucesso de 0% quando o modelo não tem solicitações', async () => {
    // Act
    const { container } = await abrirComResumo({ ...RESUMO, total: 0, concluidas: 0 });

    // Assert
    expect(within(container).getByText('0%')).toBeDefined();
  });

  it('deve pedir só as 50 solicitações do histórico, e não a lista inteira do modelo', async () => {
    // Act
    const { useSolicitacoes } = await abrirComResumo(RESUMO);

    // Assert
    expect(useSolicitacoes.mock.calls.map(([filtros]) => filtros.size)).toEqual(
      expect.arrayContaining([50]),
    );
    expect(Math.max(...useSolicitacoes.mock.calls.map(([filtros]) => filtros.size))).toBe(50);
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
