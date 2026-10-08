/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import { ModelosPage } from '@/features/admin/modelos/pages/ModelosPage';

vi.mock('@/features/admin/modelos/api/modelosApi', () => ({
  modelosApi: {
    listar: vi.fn(),
    exportarLista: vi.fn().mockResolvedValue(new Blob()),
    exportarFicha: vi.fn().mockResolvedValue(new Blob()),
  },
}));

vi.mock('@/features/admin/modelos/hooks/useModelos', () => ({
  useModelos: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('@/features/admin/modelos/hooks/useMaquinaOptions', () => ({
  useMaquinaOptions: vi.fn().mockReturnValue({ options: [], isLoading: false }),
}));
vi.mock('@/features/admin/modelos/components/ModelosTable', () => ({
  ModelosTable: ({ modelos }: { modelos: { id: string; codigo: string; ativo: boolean }[] }) => (
    <div data-testid="modelos-table">
      {modelos.map((m) => (
        <div key={m.id}>{m.codigo}</div>
      ))}
    </div>
  ),
}));
vi.mock('@/features/admin/modelos/components/ModelosFilters', () => ({
  ModelosFilters: ({
    onCodigoChange,
    onMaquinaChange,
    onDescricaoChange,
    onAtivoChange,
  }: {
    onCodigoChange: (valor?: string) => void;
    onMaquinaChange: (valor?: string) => void;
    onDescricaoChange: (valor?: string) => void;
    onAtivoChange: (valor?: boolean) => void;
  }) => (
    <div data-testid="modelos-filters">
      <button type="button" onClick={() => onCodigoChange('M01')}>
        Filtrar código M01
      </button>
      <button type="button" onClick={() => onMaquinaChange('Injetora')}>
        Filtrar máquina Injetora
      </button>
      <button type="button" onClick={() => onDescricaoChange('Tampa')}>
        Filtrar descrição Tampa
      </button>
      <button type="button" onClick={() => onAtivoChange(true)}>
        Filtrar somente ativos
      </button>
    </div>
  ),
}));

afterEach(cleanup);

describe('ModelosPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Modelos')).toBeDefined();
  });

  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando modelos/i)).toBeDefined();
  });

  it('shows empty state when no modelos', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: { content: [], page: 0, totalPages: 0, totalElements: 0 },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/nenhum modelo encontrado/i)).toBeDefined();
  });

  it('shows novo modelo link', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('link', { name: /novo modelo/i })).toBeDefined();
  });

  it('shows error state when request fails', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: undefined,
      error: new Error('fail'),
      isLoading: false,
    } as unknown as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('renders modelos table when data is available', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: {
        content: [
          {
            id: '1',
            codigo: 'M01',
            descricao: 'D',
            maquina: 'Injetora',
            versao: 1,
            observacoes: null,
            temPendenciaAberta: false,
            ativo: true,
            fotoCapaUrl: null,
            criadoEm: '',
            atualizadoEm: '',
          },
        ],
        page: 0,
        totalPages: 1,
        totalElements: 1,
      },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByTestId('modelos-table')).toBeDefined();
  });
});

function renderizarPagina(): void {
  const { AppWrapper } = createAppWrapper();
  render(<ModelosPage />, { wrapper: AppWrapper });
}

function abrirMaisAcoes(): void {
  fireEvent.click(screen.getByRole('button', { name: 'Mais ações' }));
}

async function listarComTresPaginas(): Promise<
  typeof import('@/features/admin/modelos/hooks/useModelos').useModelos
> {
  const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
  vi.mocked(useModelos).mockReset();
  vi.mocked(useModelos).mockReturnValue({
    data: {
      content: [{ id: '1', codigo: 'M01' }],
      page: 1,
      totalPages: 3,
      totalElements: 50,
    },
    error: null,
    isLoading: false,
  } as unknown as ReturnType<typeof useModelos>);
  return useModelos;
}

describe('ModelosPage filtros e paginação', () => {
  it.each([
    ['Filtrar código M01', { codigo: 'M01' }],
    ['Filtrar máquina Injetora', { maquina: 'Injetora' }],
    ['Filtrar descrição Tampa', { descricao: 'Tampa' }],
    ['Filtrar somente ativos', { ativo: true }],
  ])(
    'deve pedir a lista com o filtro na primeira página quando "%s" é acionado',
    async (nome, esperado) => {
      // Arrange
      const useModelos = await listarComTresPaginas();
      renderizarPagina();
      fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
      vi.mocked(useModelos).mockClear();

      // Act
      fireEvent.click(screen.getByRole('button', { name: nome }));

      // Assert
      expect(useModelos).toHaveBeenCalledTimes(1);
      expect(useModelos).toHaveBeenCalledWith({ ...esperado, page: 0, size: 20 });
    },
  );

  it('deve pedir a página seguinte quando Próxima é acionado', async () => {
    // Arrange
    const useModelos = await listarComTresPaginas();
    renderizarPagina();
    vi.mocked(useModelos).mockClear();

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));

    // Assert
    expect(useModelos).toHaveBeenCalledTimes(1);
    expect(useModelos).toHaveBeenCalledWith({ page: 1, size: 20 });
  });

  it('deve pedir a página anterior quando Anterior é acionado', async () => {
    // Arrange
    const useModelos = await listarComTresPaginas();
    renderizarPagina();
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    vi.mocked(useModelos).mockClear();

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));

    // Assert
    expect(useModelos).toHaveBeenCalledTimes(1);
    expect(useModelos).toHaveBeenCalledWith({ page: 0, size: 20 });
  });
});

describe('ModelosPage cabeçalho', () => {
  beforeEach(() => {
    vi.mocked(modelosApi.exportarLista).mockClear();
  });

  it('deve mostrar Novo modelo como botão principal e Mais ações quando a página abre', () => {
    // Arrange
    renderizarPagina();

    // Act
    const principal = screen.getByRole('button', { name: 'Novo modelo' });
    const mais = screen.getByRole('button', { name: 'Mais ações' });

    // Assert
    expect(principal).toBeDefined();
    expect(mais).toBeDefined();
  });

  it('deve esconder Exportar PDF do cabeçalho quando o menu está fechado', () => {
    // Arrange
    renderizarPagina();

    // Act
    const solto = screen.queryByRole('button', { name: 'Exportar PDF' });

    // Assert
    expect(solto).toBeNull();
  });

  it('deve listar Exportar PDF no menu quando Mais ações é aberto', () => {
    // Arrange
    renderizarPagina();

    // Act
    abrirMaisAcoes();

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Exportar PDF' })).toBeDefined();
  });

  it('deve exportar a lista com os filtros atuais quando Exportar PDF é escolhido', async () => {
    // Arrange
    renderizarPagina();
    abrirMaisAcoes();

    // Act
    fireEvent.click(screen.getByRole('menuitem', { name: 'Exportar PDF' }));

    // Assert
    await waitFor(() => expect(modelosApi.exportarLista).toHaveBeenCalledTimes(1));
    expect(modelosApi.exportarLista).toHaveBeenCalledWith({
      ativo: undefined,
      codigo: undefined,
      maquina: undefined,
      descricao: undefined,
    });
  });

  it('deve mostrar o erro junto do cabeçalho quando a exportação falha', async () => {
    // Arrange
    vi.mocked(modelosApi.exportarLista).mockRejectedValueOnce(new Error('falhou'));
    renderizarPagina();
    abrirMaisAcoes();

    // Act
    fireEvent.click(screen.getByRole('menuitem', { name: 'Exportar PDF' }));

    // Assert
    expect(await screen.findByText('Exportação não concluída')).toBeDefined();
  });
});
