/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { useModelos } from '@/features/admin/modelos/hooks/useModelos';
import { useMaquinaOptions } from '@/features/admin/modelos/hooks/useMaquinaOptions';
import { ModelosPage } from '@/features/modelos/pages/ModelosPage';

vi.mock('@/features/admin/modelos/hooks/useModelos', () => ({
  useModelos: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('@/features/admin/modelos/hooks/useMaquinaOptions', () => ({
  useMaquinaOptions: vi.fn().mockReturnValue({ options: [], isLoading: false }),
}));

afterEach(cleanup);

describe('ModelosPage (gestor/operador)', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Modelos')).toBeDefined();
  });

  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
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
    expect(within(container).getAllByText(/nenhum modelo/i).length).toBeGreaterThan(0);
  });

  it('shows error state', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: undefined,
      error: new Error('Falha'),
      isLoading: false,
    } as unknown as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('deve refazer a consulta quando Tentar novamente é acionado depois da falha', async () => {
    // Arrange
    const userEvent = (await import('@testing-library/user-event')).default;
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    const refetch = vi.fn();
    vi.mocked(useModelos).mockReturnValue({
      data: undefined,
      error: new Error('fail'),
      isLoading: false,
      refetch,
    } as unknown as ReturnType<typeof useModelos>);
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(within(container).getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders grid and pagination when modelos exist', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: {
        content: [
          {
            id: '1',
            codigo: 'M001',
            descricao: 'Modelo A',
            ativo: true,
            versao: 1,
            maquina: 'Máq1',
            temPendenciaAberta: false,
            fotoCapaUrl: null,
            criadoEm: '',
            atualizadoEm: '',
            observacoes: '',
          },
        ],
        page: 0,
        totalPages: 2,
        totalElements: 15,
      },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('M001')).toBeDefined();
    expect(within(container).getByText(/modelo\(s\)/i)).toBeDefined();
  });
});

describe('ModelosPage (gestor/operador) — filtros e paginação', () => {
  function abrir() {
    vi.mocked(useMaquinaOptions).mockReturnValue({
      options: [{ value: 'FBOX', label: 'FBOX' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useMaquinaOptions>);
    vi.mocked(useModelos).mockReturnValue({
      data: {
        content: [
          {
            id: '1',
            codigo: 'M001',
            descricao: 'Modelo A',
            ativo: true,
            versao: 1,
            maquina: 'FBOX',
            temPendenciaAberta: false,
            fotoCapaUrl: null,
            criadoEm: '',
            atualizadoEm: '',
            observacoes: '',
          },
        ],
        page: 1,
        totalPages: 3,
        totalElements: 30,
      },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useModelos>);
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    return within(container);
  }

  const ultimosFiltros = () => vi.mocked(useModelos).mock.calls.at(-1)![0];

  it('deve pedir o código digitado, na primeira página, quando o filtro de código muda', async () => {
    // Arrange
    const tela = abrir();

    // Act
    await userEvent.type(tela.getByLabelText('Código'), 'M0');

    // Assert
    expect(ultimosFiltros()).toMatchObject({ codigo: 'M0', page: 0 });
  });

  it('deve pedir a descrição digitada quando o filtro de descrição muda', async () => {
    // Arrange
    const tela = abrir();

    // Act
    await userEvent.type(tela.getByLabelText('Descrição'), 'Mo');

    // Assert
    expect(ultimosFiltros()).toMatchObject({ descricao: 'Mo', page: 0 });
  });

  it('deve pedir a máquina escolhida quando o filtro de máquina muda', async () => {
    // Arrange
    const tela = abrir();

    // Act
    await userEvent.selectOptions(tela.getByLabelText('Máquina'), 'FBOX');

    // Assert
    expect(ultimosFiltros()).toMatchObject({ maquina: 'FBOX', page: 0 });
  });

  it('deve pedir só os inativos quando o filtro de status muda para Inativos', async () => {
    // Arrange
    const tela = abrir();

    // Act
    await userEvent.selectOptions(tela.getByLabelText('Status'), 'false');

    // Assert
    expect(ultimosFiltros()).toMatchObject({ ativo: false, page: 0 });
  });

  it('deve pedir a página seguinte quando Próxima é acionada', async () => {
    // Arrange
    const tela = abrir();

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Próxima' }));

    // Assert
    expect(ultimosFiltros()).toMatchObject({ page: 1 });
  });

  it('deve pedir a página anterior quando Anterior é acionada', async () => {
    // Arrange
    const tela = abrir();
    await userEvent.click(tela.getByRole('button', { name: 'Próxima' }));

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Anterior' }));

    // Assert
    expect(ultimosFiltros()).toMatchObject({ page: 0 });
  });
});
