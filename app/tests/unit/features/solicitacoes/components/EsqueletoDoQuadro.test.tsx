/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { EsqueletoDoQuadro } from '@/features/solicitacoes/components/EsqueletoDoQuadro';
import { COLUMNS } from '@/features/solicitacoes/components/kanbanColunas';

afterEach(cleanup);

describe('EsqueletoDoQuadro', () => {
  it('deve anunciar o carregamento do quadro quando é desenhado', () => {
    // Act
    render(<EsqueletoDoQuadro />);

    // Assert
    expect(screen.getByRole('status').textContent).toBe('Carregando quadro...');
  });

  it('deve desenhar uma coluna de esqueleto por status do quadro quando é desenhado', () => {
    // Act
    const { container } = render(<EsqueletoDoQuadro />);

    // Assert
    expect(container.querySelectorAll('[role="status"] > div')).toHaveLength(COLUMNS.length);
  });

  it('deve desenhar cartões de esqueleto dentro de cada coluna quando é desenhado', () => {
    // Act
    const { container } = render(<EsqueletoDoQuadro />);

    // Assert
    const primeira = container.querySelector('[role="status"] > div')!;
    expect(primeira.querySelectorAll('.h-24')).toHaveLength(3);
  });
});
