/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GaleriaModelo } from './GaleriaModelo';

const { fotos, adicionarMutateAsync, editarMutateAsync, removerMutateAsync } = vi.hoisted(() => {
  const fotos = [
    {
      id: 'f1',
      modeloId: 'm1',
      publicUrl: 'http://minio/f1.jpg',
      identificacao: 'Parte 1',
      principal: true,
      enviadaPorUsuarioId: 'u1',
      criadoEm: '2026-01-01T00:00:00Z',
    },
  ];
  return {
    fotos,
    adicionarMutateAsync: vi.fn().mockResolvedValue(fotos[0]),
    editarMutateAsync: vi.fn().mockResolvedValue(fotos[0]),
    removerMutateAsync: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('../hooks/useGaleriaModelo', () => ({
  useGaleriaModelo: vi.fn().mockReturnValue({ data: fotos, isLoading: false, error: null }),
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
  it('renders a thumbnail for each photo in the gallery', () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    expect(within(container).getByRole('button', { name: /ver foto: parte 1/i })).toBeDefined();
  });

  it('shows "Ver galeria completa" and "Adicionar foto" when podeGerenciar is true', () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    expect(within(container).getByRole('button', { name: /ver galeria completa/i })).toBeDefined();
    expect(within(container).getByRole('button', { name: /adicionar foto/i })).toBeDefined();
  });

  it('hides "Adicionar foto" but keeps "Ver galeria completa" when podeGerenciar is false', () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar={false} />);
    expect(within(container).getByRole('button', { name: /ver galeria completa/i })).toBeDefined();
    expect(within(container).queryByRole('button', { name: /adicionar foto/i })).toBeNull();
  });

  it('shows a "+N" overlay on the 4th thumbnail when there are more than 4 photos', async () => {
    const { useGaleriaModelo } = await import('../hooks/useGaleriaModelo');
    const manyFotos = Array.from({ length: 6 }, (_, i) => ({
      ...fotos[0],
      id: `f${i}`,
      identificacao: `Foto ${i}`,
      principal: i === 0,
    }));
    vi.mocked(useGaleriaModelo).mockReturnValueOnce({
      data: manyFotos,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGaleriaModelo>);

    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    expect(within(container).getByText('+2')).toBeDefined();
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

  it('opens the carousel when a thumbnail is clicked', async () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    await userEvent.click(within(container).getByRole('button', { name: /ver foto: parte 1/i }));
    expect(within(container).getByRole('dialog', { name: /galeria de fotos/i })).toBeDefined();
  });

  it('opens the carousel via "Ver galeria completa"', async () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    await userEvent.click(within(container).getByRole('button', { name: /ver galeria completa/i }));
    expect(within(container).getByRole('dialog', { name: /galeria de fotos/i })).toBeDefined();
  });

  it('opens the add-photo modal and submits a new photo', async () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    await userEvent.click(within(container).getByRole('button', { name: /^adicionar foto$/i }));
    expect(within(container).getByRole('dialog', { name: /adicionar foto à galeria/i })).toBeDefined();

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
    expect(within(container).queryByRole('dialog', { name: /adicionar foto à galeria/i })).toBeNull();
  });

  it('removes a photo from within the carousel', async () => {
    const { container } = render(<GaleriaModelo modeloId="m1" podeGerenciar />);
    await userEvent.click(within(container).getByRole('button', { name: /ver galeria completa/i }));
    await userEvent.click(within(container).getByRole('button', { name: /remover foto/i }));
    const confirmButtons = within(container).getAllByRole('button', { name: /remover/i });
    await userEvent.click(confirmButtons[confirmButtons.length - 1]);
    expect(removerMutateAsync).toHaveBeenCalledWith({ modeloId: 'm1', fotoId: 'f1' });
  });
});
