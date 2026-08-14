/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GaleriaCarousel } from './GaleriaCarousel';
import type { FotoGaleria } from '../types/galeriaTypes';

afterEach(cleanup);

const fotos: FotoGaleria[] = [
  {
    id: 'f1',
    modeloId: 'm1',
    publicUrl: 'http://minio/1.jpg',
    identificacao: 'Parte 1',
    principal: true,
    enviadaPorUsuarioId: 'u1',
    criadoEm: '2026-01-01T00:00:00Z',
  },
  {
    id: 'f2',
    modeloId: 'm1',
    publicUrl: 'http://minio/2.jpg',
    identificacao: 'Parte 2',
    principal: false,
    enviadaPorUsuarioId: 'u1',
    criadoEm: '2026-01-02T00:00:00Z',
  },
];

function renderCarousel(props: Partial<Parameters<typeof GaleriaCarousel>[0]> = {}) {
  return render(
    <GaleriaCarousel
      fotos={fotos}
      initialIndex={0}
      podeGerenciar
      pendingFotoId={null}
      isSavingGlobal={false}
      isRemovingGlobal={false}
      onDefinirCapa={vi.fn()}
      onRenomear={vi.fn()}
      onRemover={vi.fn()}
      onClose={vi.fn()}
      {...props}
    />,
  );
}

describe('GaleriaCarousel', () => {
  it('shows the photo at initialIndex and the position indicator', () => {
    const { container } = renderCarousel({ initialIndex: 1 });
    expect(within(container).getByText('Parte 2')).toBeDefined();
    expect(within(container).getByText('2 / 2')).toBeDefined();
  });

  it('navigates to the next and previous photo', async () => {
    const { container } = renderCarousel();
    expect(within(container).getByText('Parte 1')).toBeDefined();

    await userEvent.click(within(container).getByRole('button', { name: /próxima foto/i }));
    expect(within(container).getByText('Parte 2')).toBeDefined();

    await userEvent.click(within(container).getByRole('button', { name: /foto anterior/i }));
    expect(within(container).getByText('Parte 1')).toBeDefined();
  });

  it('wraps around when navigating past the last photo', async () => {
    const { container } = renderCarousel({ initialIndex: 1 });
    await userEvent.click(within(container).getByRole('button', { name: /próxima foto/i }));
    expect(within(container).getByText('Parte 1')).toBeDefined();
    expect(within(container).getByText('1 / 2')).toBeDefined();
  });

  it('hides navigation arrows and position indicator with a single photo', () => {
    const { container } = renderCarousel({ fotos: [fotos[0]] });
    expect(within(container).queryByRole('button', { name: /próxima foto/i })).toBeNull();
    expect(within(container).queryByText(/1 \/ 1/)).toBeNull();
  });

  it('shows the capa badge only for the principal photo', () => {
    const { container } = renderCarousel();
    expect(within(container).getByText('Capa')).toBeDefined();
  });

  it('hides management actions when podeGerenciar is false', () => {
    const { container } = renderCarousel({ podeGerenciar: false });
    expect(within(container).queryByRole('button', { name: /remover foto/i })).toBeNull();
    expect(within(container).queryByRole('button', { name: /renomear foto/i })).toBeNull();
  });

  it('calls onDefinirCapa for the currently displayed photo', async () => {
    const onDefinirCapa = vi.fn();
    const { container } = renderCarousel({ initialIndex: 1, onDefinirCapa });
    await userEvent.click(within(container).getByRole('button', { name: /definir capa/i }));
    expect(onDefinirCapa).toHaveBeenCalledWith('f2');
  });

  it('renames the currently displayed photo', async () => {
    const onRenomear = vi.fn();
    const { container } = renderCarousel({ onRenomear });
    await userEvent.click(within(container).getByRole('button', { name: /renomear foto/i }));
    const input = container.querySelector('input') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, 'Novo nome');
    await userEvent.click(within(container).getByRole('button', { name: /salvar identificação/i }));
    expect(onRenomear).toHaveBeenCalledWith('f1', 'Novo nome');
  });

  it('resets editing state when navigating to another photo', async () => {
    const { container } = renderCarousel();
    await userEvent.click(within(container).getByRole('button', { name: /renomear foto/i }));
    expect(container.querySelector('input')).toBeDefined();

    await userEvent.click(within(container).getByRole('button', { name: /próxima foto/i }));
    expect(container.querySelector('input')).toBeNull();
    expect(within(container).getByRole('button', { name: /renomear foto/i })).toBeDefined();
  });

  it('confirms and calls onRemover for the currently displayed photo', async () => {
    const onRemover = vi.fn();
    const { container } = renderCarousel({ initialIndex: 1, onRemover });
    await userEvent.click(within(container).getByRole('button', { name: /remover foto/i }));
    expect(within(container).getByText(/removida permanentemente/i)).toBeDefined();

    const confirmButtons = within(container).getAllByRole('button', { name: /remover/i });
    await userEvent.click(confirmButtons[confirmButtons.length - 1]);
    expect(onRemover).toHaveBeenCalledWith('f2');
  });

  it('closes when the close button is clicked', async () => {
    const onClose = vi.fn();
    const { container } = renderCarousel({ onClose });
    await userEvent.click(within(container).getByRole('button', { name: /^fechar$/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when Escape is pressed', async () => {
    const onClose = vi.fn();
    renderCarousel({ onClose });
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('navigates with arrow keys', async () => {
    const { container } = renderCarousel();
    await userEvent.keyboard('{ArrowRight}');
    expect(within(container).getByText('Parte 2')).toBeDefined();
    await userEvent.keyboard('{ArrowLeft}');
    expect(within(container).getByText('Parte 1')).toBeDefined();
  });

  it('closes automatically when the gallery becomes empty', () => {
    const onClose = vi.fn();
    renderCarousel({ fotos: [], onClose });
    expect(onClose).toHaveBeenCalled();
  });
});
