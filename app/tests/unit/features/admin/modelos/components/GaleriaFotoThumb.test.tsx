/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GaleriaFotoThumb } from '@/features/admin/modelos/components/GaleriaFotoThumb';
import type { FotoGaleria } from '@/features/admin/modelos/types/galeriaTypes';

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
    const { container } = render(
      <GaleriaFotoThumb foto={{ ...foto, principal: true }} onClick={vi.fn()} />,
    );
    expect(container.querySelector('svg')).toBeDefined();
  });

  it('shows an overlay with the extra count when overlayCount is set', () => {
    const { container } = render(
      <GaleriaFotoThumb foto={foto} overlayCount={3} onClick={vi.fn()} />,
    );
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

  it('deve mostrar a contagem extra com o texto sobre foto quando há mais fotos', () => {
    // Arrange
    const extras = 3;

    // Act
    const { container } = render(
      <GaleriaFotoThumb foto={foto} overlayCount={extras} onClick={vi.fn()} />,
    );

    // Assert
    const contagem = within(container).getByText(`+${extras}`);
    expect(contagem.className.split(' ')).toContain('text-on-solid');
  });

  it('deve marcar aria-current e o contorno quando ativa', () => {
    // Arrange
    const { container } = render(<GaleriaFotoThumb foto={foto} ativa onClick={vi.fn()} />);

    // Act
    const botao = within(container).getByRole('button');

    // Assert
    expect(botao.getAttribute('aria-current')).toBe('true');
    expect(botao.className.split(' ')).toEqual(
      expect.arrayContaining(['border-accent', 'ring-2', 'ring-accent']),
    );
  });

  it('deve omitir aria-current quando não ativa', () => {
    // Arrange
    const { container } = render(<GaleriaFotoThumb foto={foto} onClick={vi.fn()} />);

    // Act
    const botao = within(container).getByRole('button');

    // Assert
    expect(botao.hasAttribute('aria-current')).toBe(false);
  });

  it('deve mostrar o ícone de imagem indisponível quando a imagem falha', () => {
    // Arrange
    const { container } = render(<GaleriaFotoThumb foto={foto} onClick={vi.fn()} />);

    // Act
    fireEvent.error(container.querySelector('img') as HTMLImageElement);

    // Assert
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg.lucide-image-off')).not.toBeNull();
  });

  it('deve mostrar a estrela quando a foto é a capa', () => {
    // Arrange
    const capa = { ...foto, principal: true };

    // Act
    const { container } = render(<GaleriaFotoThumb foto={capa} onClick={vi.fn()} />);

    // Assert
    expect(container.querySelector('svg.lucide-star')).not.toBeNull();
  });

  it('deve ocultar a estrela quando a foto não é a capa', () => {
    // Arrange
    const { container } = render(<GaleriaFotoThumb foto={foto} onClick={vi.fn()} />);

    // Act
    const estrela = container.querySelector('svg.lucide-star');

    // Assert
    expect(estrela).toBeNull();
  });

  it('deve ocultar o +N quando overlayCount não é informado', () => {
    // Arrange
    const { container } = render(<GaleriaFotoThumb foto={foto} onClick={vi.fn()} />);

    // Act
    const contagem = within(container).queryByText(/^\+\d+$/);

    // Assert
    expect(contagem).toBeNull();
  });

  it('deve nomear o botão pela galeria completa quando overlayCount é informado', () => {
    // Arrange
    const { container } = render(
      <GaleriaFotoThumb foto={foto} overlayCount={5} onClick={vi.fn()} />,
    );

    // Act
    const botao = within(container).getByRole('button');

    // Assert
    expect(botao.getAttribute('aria-label')).toBe('Ver galeria completa (mais 5 fotos)');
    expect(within(container).getByText('+5')).toBeDefined();
  });

  it('deve chamar onClick uma vez quando o botão é clicado', async () => {
    // Arrange
    const onClick = vi.fn();
    const { container } = render(<GaleriaFotoThumb foto={foto} onClick={onClick} />);

    // Act
    await userEvent.click(within(container).getByRole('button'));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('deve não ter outline-none quando renderizada', () => {
    // Arrange
    const { container } = render(<GaleriaFotoThumb foto={foto} ativa onClick={vi.fn()} />);

    // Act
    const botao = within(container).getByRole('button');

    // Assert
    expect(botao.className).not.toContain('outline-none');
  });

  it('deve animar só sob motion-safe quando renderizada', () => {
    // Arrange
    const { container } = render(<GaleriaFotoThumb foto={foto} onClick={vi.fn()} />);

    // Act
    const classes = Array.from(container.querySelectorAll('*')).flatMap((elemento) =>
      Array.from(elemento.classList),
    );

    // Assert
    const semProtecao = classes.filter(
      (classe) =>
        /(^|:)(transition|duration|animate)/.test(classe) && !classe.startsWith('motion-safe:'),
    );
    expect(semProtecao).toEqual([]);
  });
});
