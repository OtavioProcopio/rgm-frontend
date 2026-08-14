/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GaleriaFotoThumb } from './GaleriaFotoThumb';
import type { FotoGaleria } from '../types/galeriaTypes';

afterEach(cleanup);

const foto: FotoGaleria = {
  id: 'f1',
  modeloId: 'm1',
  publicUrl: 'http://minio/foto.jpg',
  identificacao: 'Parte 1',
  principal: false,
  enviadaPorUsuarioId: 'u1',
  criadoEm: '2026-01-01T00:00:00Z',
};

describe('GaleriaFotoThumb', () => {
  it('renders the photo and calls onClick', async () => {
    const onClick = vi.fn();
    const { container } = render(<GaleriaFotoThumb foto={foto} onClick={onClick} />);
    await userEvent.click(within(container).getByRole('button', { name: /ver foto: parte 1/i }));
    expect(onClick).toHaveBeenCalled();
  });

  it('shows a capa indicator when principal', () => {
    const { container } = render(<GaleriaFotoThumb foto={{ ...foto, principal: true }} onClick={vi.fn()} />);
    expect(container.querySelector('svg')).toBeDefined();
  });

  it('shows an overlay with the extra count when overlayCount is set', () => {
    const { container } = render(<GaleriaFotoThumb foto={foto} overlayCount={3} onClick={vi.fn()} />);
    expect(within(container).getByText('+3')).toBeDefined();
    expect(
      within(container).getByRole('button', { name: /ver galeria completa \(mais 3 fotos\)/i }),
    ).toBeDefined();
  });

  it('shows a placeholder icon when the image fails to load', () => {
    const { container } = render(<GaleriaFotoThumb foto={foto} onClick={vi.fn()} />);
    const img = container.querySelector('img') as HTMLImageElement;
    fireEvent.error(img);
    expect(container.querySelector('img')).toBeNull();
  });
});
