/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { NovoModeloPage } from '@/features/admin/modelos/pages/NovoModeloPage';

const { mutateAsync, navigate } = vi.hoisted(() => ({
  mutateAsync: vi.fn().mockResolvedValue({ id: '123', codigo: 'M01' }),
  navigate: vi.fn(),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return { ...actual, useNavigate: () => navigate };
});

vi.mock('@/features/admin/modelos/hooks/useCriarModelo', () => ({
  useCriarModelo: vi.fn().mockReturnValue({ mutateAsync, isPending: false }),
}));
vi.mock('@/features/admin/modelos/components/ModeloForm', () => ({
  ModeloForm: ({ onSubmit }: { onSubmit: (v: unknown) => void }) => (
    <button onClick={() => onSubmit({ codigo: 'M01' })}>Salvar</button>
  ),
}));
vi.mock('@/features/admin/modelos/components/GaleriaModelo', () => ({
  GaleriaModelo: ({
    modeloId,
    codigo,
    podeGerenciar,
  }: {
    modeloId: string;
    codigo: string;
    podeGerenciar: boolean;
  }) => (
    <div
      data-testid="galeria-modelo"
      data-modelo-id={modeloId}
      data-codigo={codigo}
      data-pode-gerenciar={String(podeGerenciar)}
    />
  ),
}));

afterEach(cleanup);

describe('NovoModeloPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Novo modelo')).toBeDefined();
  });

  it('renders form', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('button', { name: 'Salvar' })).toBeDefined();
  });

  it('shows the gallery step for the newly created model after submit', async () => {
    const user = userEvent.setup();
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoModeloPage />, { wrapper: AppWrapper });

    await user.click(within(container).getByRole('button', { name: 'Salvar' }));

    expect(within(container).getByText('Modelo cadastrado')).toBeDefined();
    const galeria = within(container).getByTestId('galeria-modelo');
    expect(galeria.dataset.modeloId).toBe('123');
    expect(galeria.dataset.codigo).toBe('M01');
    expect(galeria.dataset.podeGerenciar).toBe('true');
  });

  it('navigates to the model detail page without requiring any photo', async () => {
    const user = userEvent.setup();
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoModeloPage />, { wrapper: AppWrapper });

    await user.click(within(container).getByRole('button', { name: 'Salvar' }));
    await user.click(
      within(container).getByRole('button', { name: 'Ir para o detalhe do modelo' }),
    );

    expect(navigate).toHaveBeenCalledWith('/app/admin/modelos/123');
  });

  it('deve mostrar a mensagem de erro e manter o formulário quando a criação falha', async () => {
    // Arrange
    mutateAsync.mockRejectedValueOnce(new Error('falha'));
    const user = userEvent.setup();
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoModeloPage />, { wrapper: AppWrapper });

    // Act
    await user.click(within(container).getByRole('button', { name: 'Salvar' }));

    // Assert
    expect(mutateAsync).toHaveBeenCalledWith({ codigo: 'M01' });
    expect(within(container).getByText('Não foi possível criar o modelo')).toBeDefined();
    expect(
      within(container).getByText('Não foi possível concluir a operação. Tente novamente.'),
    ).toBeDefined();
    expect(within(container).getByRole('button', { name: 'Salvar' })).toBeDefined();
    expect(within(container).queryByTestId('galeria-modelo')).toBeNull();
  });

  it('deve apontar o link de volta para o caminho informado quando backPath é passado', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper();

    // Act
    const { container } = render(<NovoModeloPage backPath="/app/outro" />, {
      wrapper: AppWrapper,
    });

    // Assert
    const link = within(container).getByRole('link', { name: /Voltar para modelos/ });
    expect(link.getAttribute('href')).toBe('/app/outro');
  });
});
