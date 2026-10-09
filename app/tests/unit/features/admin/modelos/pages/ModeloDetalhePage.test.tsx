/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
vi.mock('@/features/admin/modelos/components/HistoricoDoModelo', () => ({
  HistoricoDoModelo: vi.fn(() => <div data-testid="historico-modelo" />),
}));
vi.mock('@/features/admin/modelos/components/GaleriaModelo', () => ({
  GaleriaModelo: vi.fn(() => <div data-testid="galeria-modelo" />),
}));

beforeEach(async () => {
  const { useEventosModelo } = await import('@/features/admin/modelos/hooks/useEventosModelo');
  const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
  vi.mocked(useEventosModelo).mockReturnValue({ data: [] } as unknown as ReturnType<
    typeof useEventosModelo
  >);
  vi.mocked(useSolicitacoes).mockReturnValue({ data: undefined } as unknown as ReturnType<
    typeof useSolicitacoes
  >);
});

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

  it('deve mostrar "12 min" no tempo médio quando a resolução média é de 12 minutos', async () => {
    // Act
    const { container } = await abrirComResumo({ ...RESUMO, tempoMedioResolucaoSegundos: 720 });

    // Assert
    const cartao = within(container).getByText('Tempo médio de resolução')
      .parentElement as HTMLElement;
    expect(within(cartao).getByText('12 min')).toBeDefined();
  });

  it('deve mostrar "Sem dados ainda" nos dois tempos quando o resumo não traz tempo', async () => {
    // Act
    const { container } = await abrirComResumo({
      ...RESUMO,
      tempoMedioResolucaoSegundos: null,
      intervaloMedioSegundos: null,
    });

    // Assert
    expect(within(container).getAllByText('Sem dados ainda')).toHaveLength(2);
    expect(within(container).queryByText('—')).toBeNull();
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

  it('deve mostrar o erro da operação e fechar o diálogo quando a desativação falha', async () => {
    // Arrange
    const { useDesativarModelo } =
      await import('@/features/admin/modelos/hooks/useDesativarModelo');
    const mutateAsync = vi.fn().mockRejectedValue(new Error('falhou'));
    vi.mocked(useDesativarModelo).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useDesativarModelo>);
    await abrirDetalhe(true);
    await abrirMaisAcoes();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Desativar' }));

    // Act
    const dialogo = screen.getByRole('dialog', { name: 'Desativar modelo' });
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Desativar' }));

    // Assert
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith('1');
    expect(await screen.findByText('Operação não concluída')).toBeDefined();
    expect(
      screen.getByText('Não foi possível concluir a operação. Tente novamente.'),
    ).toBeDefined();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('deve não ativar quando a confirmação de ativação é cancelada', async () => {
    // Arrange
    const { useAtivarModelo } = await import('@/features/admin/modelos/hooks/useAtivarModelo');
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useAtivarModelo).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useAtivarModelo>);
    await abrirDetalhe(false);
    await abrirMaisAcoes();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Ativar' }));

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('ModeloDetalhePage (admin) — corpo da ficha', () => {
  async function abrirFicha(
    dadosDoModelo: Record<string, unknown>,
    solicitacoes: Record<string, unknown> = { content: [], totalElements: 0 },
    rota = '/modelos/1',
  ) {
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    vi.mocked(useModelo).mockReturnValue({
      data: { ...modelo, ...dadosDoModelo },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useModelo>);
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: solicitacoes,
    } as unknown as ReturnType<typeof useSolicitacoes>);
    const { AppWrapper } = createAppWrapper({
      initialEntries: [rota],
      user: { nome: 'Teste', perfil: 'ADMINISTRADOR' },
    });
    render(
      <Routes>
        <Route path="/modelos/:id" element={<ModeloDetalhePage />} />
        <Route path="/modelos" element={<ModeloDetalhePage />} />
      </Routes>,
      { wrapper: AppWrapper },
    );
  }

  it('deve mostrar as observações do modelo quando elas existem', async () => {
    // Arrange
    await abrirFicha({ observacoes: 'Revisar encaixe' });

    // Act
    const observacoes = screen.getByText('Revisar encaixe');

    // Assert
    expect(observacoes.tagName).toBe('P');
  });

  it('deve mostrar o rótulo do tipo quando o modelo tem tipo', async () => {
    // Arrange
    await abrirFicha({ tipo: 'RESINA' });

    // Act
    const tipo = screen.getByText('Tipo do Modelo').parentElement as HTMLElement;

    // Assert
    expect(within(tipo).getByText('Resina')).toBeDefined();
  });

  it('deve mostrar o código e a versão em destaque quando o modelo é carregado', async () => {
    // Arrange
    await abrirFicha({});

    // Act
    const titulo = screen.getByRole('heading', { name: /M01.*v1/ });

    // Assert
    expect(titulo.textContent).toContain('v1');
    expect(within(titulo).getByText('M01')).toBeDefined();
  });

  it('deve manter o cartão de identificação na altura do conteúdo quando a foto é mais alta', async () => {
    // Arrange
    await abrirFicha({});

    // Act
    const cartao = screen.getByRole('heading', { name: /M01.*v1/ }).closest('div')!;

    // Assert
    expect(cartao.classList.contains('lg:self-start')).toBe(true);
  });

  it('deve usar fonte monoespaçada no código quando o modelo é carregado', async () => {
    // Arrange
    await abrirFicha({});

    // Act
    const codigo = screen.getByText('M01');

    // Assert
    expect(codigo.classList.contains('font-mono')).toBe(true);
  });

  it('deve mostrar os selos Ativo e Pendência aberta quando o modelo está ativo e tem pendência', async () => {
    // Arrange
    await abrirFicha({ ativo: true, temPendenciaAberta: true });

    // Act
    const ativo = screen.getByText('Ativo');
    const pendencia = screen.getByText('Pendência aberta');

    // Assert
    expect(ativo).toBeDefined();
    expect(pendencia).toBeDefined();
  });

  it('deve não mostrar o selo de pendência quando o modelo não tem pendência aberta', async () => {
    // Arrange
    await abrirFicha({ temPendenciaAberta: false });

    // Act
    const pendencia = screen.queryByText('Pendência aberta');

    // Assert
    expect(pendencia).toBeNull();
  });

  it('deve mostrar o selo Inativo quando o modelo está inativo', async () => {
    // Arrange
    await abrirFicha({ ativo: false });

    // Act
    const inativo = screen.getByText('Inativo');

    // Assert
    expect(inativo).toBeDefined();
  });

  it('deve mostrar a máquina na grade de dados quando o modelo tem máquina', async () => {
    // Arrange
    await abrirFicha({});

    // Act
    const maquina = screen.getByText('Máquina / Encaixe').parentElement as HTMLElement;

    // Assert
    expect(within(maquina).getByText('Prensa PH-200')).toBeDefined();
  });

  it.each(['Criado em', 'Atualizado em'])(
    'deve mostrar "%s" com a data formatada quando o modelo é carregado',
    async (rotulo) => {
      // Arrange
      await abrirFicha({});

      // Act
      const item = screen.getByText(rotulo).parentElement as HTMLElement;

      // Assert
      expect(item.querySelector('dd')?.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    },
  );

  it('deve não mostrar "Pendência aberta: Sim" na grade de dados quando há pendência', async () => {
    // Arrange
    await abrirFicha({ temPendenciaAberta: true });

    // Act
    const dados = document.querySelectorAll('dt');

    // Assert
    const rotulos = Array.from(dados).map((dt) => dt.textContent);
    expect(rotulos).not.toContain('Pendência aberta');
    expect(screen.queryByText('Sim')).toBeNull();
  });

  it('deve entregar à galeria o id e o código quando o modelo é carregado', async () => {
    // Arrange
    const { GaleriaModelo } = await import('@/features/admin/modelos/components/GaleriaModelo');
    vi.mocked(GaleriaModelo).mockClear();

    // Act
    await abrirFicha({});

    // Assert
    expect(vi.mocked(GaleriaModelo).mock.calls[0][0]).toEqual({
      modeloId: '1',
      codigo: 'M01',
      podeGerenciar: true,
    });
  });

  it('deve oferecer as abas Resumo e Histórico, sem Solicitações, quando o modelo é carregado', async () => {
    // Arrange
    await abrirFicha({});

    // Act
    const abas = screen.getAllByRole('tab').map((aba) => aba.textContent);

    // Assert
    expect(abas).toEqual(['Resumo', 'Histórico']);
    expect(screen.queryByRole('tab', { name: 'Solicitações' })).toBeNull();
  });

  it('deve abrir a aba Resumo por padrão quando o modelo é carregado', async () => {
    // Arrange
    await abrirFicha({});

    // Act
    const resumo = screen.getByRole('tab', { name: 'Resumo' });

    // Assert
    expect(resumo.getAttribute('aria-selected')).toBe('true');
    const painelDoHistorico = screen.getByTestId('historico-modelo').closest('[role="tabpanel"]');
    expect(painelDoHistorico?.hasAttribute('hidden')).toBe(true);
  });

  it('deve nomear o conjunto de abas como Detalhes do modelo quando o modelo é carregado', async () => {
    // Arrange
    await abrirFicha({});

    // Act
    const lista = screen.getByRole('tablist', { name: 'Detalhes do modelo' });

    // Assert
    expect(lista).toBeDefined();
  });

  it('deve mostrar os indicadores no Resumo quando o resumo das solicitações é carregado', async () => {
    // Arrange
    const { useResumoDasSolicitacoesDoModelo } =
      await import('@/features/solicitacoes/hooks/useResumoDasSolicitacoesDoModelo');
    vi.mocked(useResumoDasSolicitacoesDoModelo).mockReturnValue({
      data: {
        total: 40,
        emAberto: 6,
        concluidas: 30,
        canceladas: 4,
        tempoMedioResolucaoSegundos: 720,
        intervaloMedioSegundos: 3600,
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useResumoDasSolicitacoesDoModelo>);
    await abrirFicha({});

    // Act
    const total = screen.getByText('Total');

    // Assert
    expect(total).toBeDefined();
    expect(screen.getByText('12 min')).toBeDefined();
  });

  it('deve entregar eventos, solicitações e total ao histórico quando a aba Histórico é escolhida', async () => {
    // Arrange
    const { HistoricoDoModelo } =
      await import('@/features/admin/modelos/components/HistoricoDoModelo');
    const { useEventosModelo } = await import('@/features/admin/modelos/hooks/useEventosModelo');
    const eventos = [{ id: 'e1' }];
    const solicitacoes = [{ id: 's1', titulo: 'Trocar pino', status: 'CONCLUIDA' }];
    vi.mocked(useEventosModelo).mockReturnValue({ data: eventos } as unknown as ReturnType<
      typeof useEventosModelo
    >);
    vi.mocked(HistoricoDoModelo).mockClear();
    await abrirFicha({}, { content: solicitacoes, totalElements: 7 });

    // Act
    await userEvent.click(screen.getByRole('tab', { name: 'Histórico' }));

    // Assert
    expect(screen.getByTestId('historico-modelo')).toBeDefined();
    expect(vi.mocked(HistoricoDoModelo).mock.calls.at(-1)?.[0]).toEqual({
      eventos,
      solicitacoes,
      totalDeSolicitacoes: 7,
    });
  });

  it('deve mostrar "Não definido" no tipo quando o modelo não tem tipo', async () => {
    // Arrange
    await abrirFicha({ tipo: null });

    // Act
    const tipo = screen.getByText('Tipo do Modelo').parentElement as HTMLElement;

    // Assert
    expect(within(tipo).getByText('Não definido')).toBeDefined();
  });

  it('deve entregar listas vazias ao histórico quando eventos e solicitações ainda não foram carregados', async () => {
    // Arrange
    const { HistoricoDoModelo } =
      await import('@/features/admin/modelos/components/HistoricoDoModelo');
    const { useEventosModelo } = await import('@/features/admin/modelos/hooks/useEventosModelo');
    vi.mocked(useEventosModelo).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useEventosModelo>);
    vi.mocked(HistoricoDoModelo).mockClear();
    await abrirFicha({}, null as unknown as Record<string, unknown>);

    // Act
    await userEvent.click(screen.getByRole('tab', { name: 'Histórico' }));

    // Assert
    expect(vi.mocked(HistoricoDoModelo).mock.calls.at(-1)?.[0]).toEqual({
      eventos: [],
      solicitacoes: [],
      totalDeSolicitacoes: undefined,
    });
  });

  it('deve esconder a galeria e as ações do cabeçalho quando a rota não tem id', async () => {
    // Arrange
    await abrirFicha({}, undefined, '/modelos');

    // Act
    const galeria = screen.queryByTestId('galeria-modelo');

    // Assert
    expect(galeria).toBeNull();
    expect(screen.queryByRole('link', { name: 'Editar' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Exportar PDF' })).toBeNull();
  });
});
