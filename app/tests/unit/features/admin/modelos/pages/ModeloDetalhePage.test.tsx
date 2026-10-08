/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import type { PerfilUsuario } from '@/features/auth/types/authTypes';
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

  async function abrirComResumo(
    resumo: Record<string, unknown> | undefined,
    estadoDoResumo: { isLoading?: boolean; isError?: boolean } = {},
  ) {
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    const { useResumoDasSolicitacoesDoModelo } =
      await import('@/features/solicitacoes/hooks/useResumoDasSolicitacoesDoModelo');
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
      isLoading: false,
      isError: false,
      ...estadoDoResumo,
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

  it('deve avisar que o resumo não pôde ser carregado quando a API falha', async () => {
    // Act
    const { container } = await abrirComResumo(undefined, { isError: true });

    // Assert
    expect(within(container).getByRole('alert').textContent).toBe(
      'Não foi possível carregar o resumo das solicitações deste modelo.',
    );
  });

  it('deve não mostrar indicadores zerados quando o resumo falha', async () => {
    // Act
    const { container } = await abrirComResumo(undefined, { isError: true });

    // Assert
    expect(within(container).queryByText('Taxa de sucesso')).toBeNull();
  });

  it('deve dizer que o resumo está carregando, sem indicadores, enquanto a API não responde', async () => {
    // Act
    const { container } = await abrirComResumo(undefined, { isLoading: true });

    // Assert
    expect(within(container).getByRole('status').textContent).toBe(
      'Carregando o resumo das solicitações...',
    );
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
  async function abrirDetalhe(ativo: boolean, perfil: PerfilUsuario = 'ADMINISTRADOR') {
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: { ...modelo, ativo },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useModelo>);
    const { AppWrapper } = createAppWrapper({
      initialEntries: ['/modelos/1'],
      user: { nome: 'Teste', perfil },
    });
    render(
      <Routes>
        <Route path="/modelos/:id" element={<ModeloDetalhePage />} />
      </Routes>,
      { wrapper: AppWrapper },
    );
  }

  async function abrirMaisAcoes() {
    await userEvent.click(screen.getByRole('button', { name: /mais ações/i }));
  }

  it('deve mostrar Editar como botão e o botão Mais ações quando o usuário gerencia modelos', async () => {
    // Arrange
    await abrirDetalhe(true);

    // Act
    const editar = screen.getByRole('link', { name: 'Editar' });

    // Assert
    expect(editar.getAttribute('href')).toBe('/app/admin/modelos/1/editar');
    expect(screen.getByRole('button', { name: /mais ações/i })).toBeDefined();
  });

  it('deve destacar Editar como a ação principal quando o usuário gerencia modelos', async () => {
    // Arrange
    await abrirDetalhe(true);

    // Act
    const botaoEditar = screen.getByRole('link', { name: 'Editar' }).querySelector('button');

    // Assert
    expect(botaoEditar?.classList.contains('bg-accent')).toBe(true);
  });

  it.each(['Exportar PDF', 'Desativar'])(
    'deve esconder "%s" do cabeçalho quando o menu Mais ações está fechado',
    async (rotulo) => {
      // Arrange
      await abrirDetalhe(true);

      // Act
      const solto = screen.queryByRole('button', { name: rotulo });

      // Assert
      expect(solto).toBeNull();
    },
  );

  it('deve esconder "Ativar" do cabeçalho quando o modelo está inativo e o menu está fechado', async () => {
    // Arrange
    await abrirDetalhe(false);

    // Act
    const solto = screen.queryByRole('button', { name: 'Ativar' });

    // Assert
    expect(solto).toBeNull();
  });

  it('deve listar Exportar PDF e Desativar no menu quando o modelo está ativo', async () => {
    // Arrange
    await abrirDetalhe(true);

    // Act
    await abrirMaisAcoes();

    // Assert
    const itens = screen.getAllByRole('menuitem').map((item) => item.textContent);
    expect(itens).toEqual(['Exportar PDF', 'Desativar']);
  });

  it('deve ter Desativar como último item do menu com a cor de perigo quando o modelo está ativo', async () => {
    // Arrange
    await abrirDetalhe(true);

    // Act
    await abrirMaisAcoes();

    // Assert
    const itens = screen.getAllByRole('menuitem');
    const ultimo = itens[itens.length - 1];
    expect(ultimo.textContent).toBe('Desativar');
    expect(ultimo.className).toContain('text-danger-fg');
  });

  it('deve listar Exportar PDF e Ativar no menu, sem Desativar, quando o modelo está inativo', async () => {
    // Arrange
    await abrirDetalhe(false);

    // Act
    await abrirMaisAcoes();

    // Assert
    const itens = screen.getAllByRole('menuitem').map((item) => item.textContent);
    expect(itens).toEqual(['Exportar PDF', 'Ativar']);
  });

  it('deve chamar a desativação só ao confirmar quando Desativar é escolhido no menu', async () => {
    // Arrange
    const { useDesativarModelo } =
      await import('@/features/admin/modelos/hooks/useDesativarModelo');
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useDesativarModelo).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useDesativarModelo>);
    await abrirDetalhe(true);
    await abrirMaisAcoes();

    // Act
    await userEvent.click(screen.getByRole('menuitem', { name: 'Desativar' }));
    const chamadasAntes = mutateAsync.mock.calls.length;
    const dialogo = screen.getByRole('dialog', { name: 'Desativar modelo' });
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Desativar' }));

    // Assert
    expect(chamadasAntes).toBe(0);
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith('1');
  });

  it('deve não desativar quando a confirmação é cancelada', async () => {
    // Arrange
    const { useDesativarModelo } =
      await import('@/features/admin/modelos/hooks/useDesativarModelo');
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useDesativarModelo).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useDesativarModelo>);
    await abrirDetalhe(true);
    await abrirMaisAcoes();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Desativar' }));

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('deve chamar a ativação ao confirmar quando o modelo está inativo', async () => {
    // Arrange
    const { useAtivarModelo } = await import('@/features/admin/modelos/hooks/useAtivarModelo');
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useAtivarModelo).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useAtivarModelo>);
    await abrirDetalhe(false);
    await abrirMaisAcoes();

    // Act
    await userEvent.click(screen.getByRole('menuitem', { name: 'Ativar' }));
    const dialogo = screen.getByRole('dialog', { name: 'Ativar modelo' });
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Ativar' }));

    // Assert
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith('1');
  });

  it('deve exportar a ficha do modelo quando Exportar PDF é escolhido no menu', async () => {
    // Arrange
    const { modelosApi } = await import('@/features/admin/modelos/api/modelosApi');
    vi.mocked(modelosApi.exportarFicha).mockClear();
    await abrirDetalhe(true);
    await abrirMaisAcoes();

    // Act
    await userEvent.click(screen.getByRole('menuitem', { name: 'Exportar PDF' }));

    // Assert
    expect(modelosApi.exportarFicha).toHaveBeenCalledTimes(1);
    expect(modelosApi.exportarFicha).toHaveBeenCalledWith('1');
  });

  it('deve mostrar o erro junto do cabeçalho quando a exportação falha', async () => {
    // Arrange
    const { modelosApi } = await import('@/features/admin/modelos/api/modelosApi');
    vi.mocked(modelosApi.exportarFicha).mockRejectedValueOnce(new Error('falhou'));
    await abrirDetalhe(true);
    await abrirMaisAcoes();

    // Act
    await userEvent.click(screen.getByRole('menuitem', { name: 'Exportar PDF' }));

    // Assert
    expect(await screen.findByText('Exportação não concluída')).toBeDefined();
    expect(screen.getByText(/Não foi possível exportar o PDF/)).toBeDefined();
  });

  it('deve mostrar só o botão Exportar PDF e nenhum Mais ações quando o usuário não gerencia modelos', async () => {
    // Arrange
    await abrirDetalhe(true, 'OPERADOR');

    // Act
    const exportar = screen.getByRole('button', { name: 'Exportar PDF' });

    // Assert
    expect(exportar).toBeDefined();
    expect(screen.queryByRole('button', { name: /mais ações/i })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Editar' })).toBeNull();
  });

  it.each([
    [true, 'Desativar', 'Desativar modelo'],
    [false, 'Ativar', 'Ativar modelo'],
  ])(
    'deve abrir a confirmação como diálogo modal com o foco em Cancelar quando o modelo ativo=%s e o item do menu é %s',
    async (ativo, botao, titulo) => {
      // Arrange
      await abrirDetalhe(ativo);
      await abrirMaisAcoes();

      // Act
      await userEvent.click(screen.getByRole('menuitem', { name: botao }));

      // Assert
      const dialogo = screen.getByRole('dialog', { name: titulo });
      expect(dialogo.getAttribute('aria-modal')).toBe('true');
      expect(document.activeElement).toBe(
        within(dialogo).getByRole('button', { name: 'Cancelar' }),
      );
    },
  );

  it('deve fechar a confirmação e devolver o foco ao botão Mais ações quando Esc é apertado', async () => {
    // Arrange
    await abrirDetalhe(true);
    await abrirMaisAcoes();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Desativar' }));

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /mais ações/i }));
  });
});
