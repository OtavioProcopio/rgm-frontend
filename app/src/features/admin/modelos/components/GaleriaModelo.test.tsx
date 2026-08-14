/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GaleriaModelo } from './GaleriaModelo';

const { foto, adicionarMutateAsync, editarMutateAsync, removerMutateAsync } = vi.hoisted(() => {
  const foto = {
    id: 'f1',
    modeloId: 'm1',
    publicUrl: 'http://minio/f1.jpg',
    identificacao: 'Parte 1',
    principal: true,
    enviadaPorUsuarioId: 'u1',
    criadoEm: '2026-01-01T00:00:00Z',
  };
  return {
    foto,
    adicionarMutateAsync: vi.fn().mockResolvedValue(foto),
    editarMutateAsync: vi.fn().mockResolvedValue(foto),
    removerMutateAsync: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('../hooks/useGaleriaModelo', () => ({
  useGaleriaModelo: vi.fn().mockReturnValue({ data: [foto], isLoading: false, error: null }),
}));
vi.mock('../hooks/useAdicionarFotoGaleria', () => ({
  useAdicionarFotoGaleria: vi.fn().mockReturnValue({ mutateAsync: adicionarMutateAsync, isPending: false }),
}));
vi.mock('../hooks/useEditarFotoGaleria', () => ({
  useEditarFotoGaleria: vi.fn().mockReturnValue({ mutateAsync: editarMutateAsync, isPending: false }),
}));
vi.mock('../hooks/useRemoverFotoGaleria', () => ({
  useRemoverFotoGaleria: vi.fn().mockReturnValue({ mutateAsync: removerMutateAsync, isPending: false }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('GaleriaModelo', () => {
  it('renders photos from the gallery', () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    expect(within(container).getByText('Parte 1')).toBeDefined();
  });

  it('shows the add-photo tile when podeGerenciar is true', () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    expect(within(container).getByRole('button', { name: /adicionar foto/i })).toBeDefined();
  });

  it('hides the add-photo tile when podeGerenciar is false', () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar={false} />);
    expect(within(container).queryByRole('button', { name: /adicionar foto/i })).toBeNull();
  });

  it('opens the add-photo modal when the tile is clicked, and closes on X', async () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    await userEvent.click(within(container).getByRole('button', { name: /adicionar foto/i }));
    expect(within(container).getByRole('dialog', { name: /adicionar foto à galeria/i })).toBeDefined();

    await userEvent.click(within(container).getByRole('button', { name: /fechar/i }));
    expect(within(container).queryByRole('dialog')).toBeNull();
  });

  it('closes the add-photo modal when cancel is clicked', async () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    await userEvent.click(within(container).getByRole('button', { name: /adicionar foto/i }));
    await userEvent.click(within(container).getByRole('button', { name: /cancelar/i }));
    expect(within(container).queryByRole('dialog')).toBeNull();
  });

  it('submits a new photo and closes the modal on success', async () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    await userEvent.click(within(container).getByRole('button', { name: /^adicionar foto$/i }));

    await userEvent.type(within(container).getByLabelText(/identificação/i), 'Nova foto');
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['a'], 'foto.png', { type: 'image/png' });
    await userEvent.upload(fileInput, file);

    const submitButtons = within(container).getAllByRole('button', { name: /adicionar foto/i });
    await userEvent.click(submitButtons[submitButtons.length - 1]);

    expect(adicionarMutateAsync).toHaveBeenCalledWith({
      modeloId: 'm1',
      file,
      identificacao: 'Nova foto',
    });
    expect(within(container).queryByRole('dialog')).toBeNull();
  });

  it('shows empty state when there are no photos', async () => {
    const { useGaleriaModelo } = await import('../hooks/useGaleriaModelo');
    vi.mocked(useGaleriaModelo).mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGaleriaModelo>);

    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    expect(within(container).getByText(/nenhuma foto na galeria/i)).toBeDefined();
  });

  it('calls the remover mutation when a photo removal is confirmed', async () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    await userEvent.click(within(container).getByRole('button', { name: /remover/i }));
    const confirmButtons = within(container).getAllByRole('button', { name: /remover/i });
    await userEvent.click(confirmButtons[confirmButtons.length - 1]);
    expect(removerMutateAsync).toHaveBeenCalledWith({ modeloId: 'm1', fotoId: 'f1' });
  });
});
