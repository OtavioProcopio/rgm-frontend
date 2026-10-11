/**
 * @vitest-environment jsdom
 */
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Skeleton } from '@/shared/components/Skeleton/Skeleton';

afterEach(cleanup);

describe('Skeleton', () => {
  it('deve ser decorativo para o leitor de tela quando é desenhado', () => {
    // Act
    const { container } = render(<Skeleton />);

    // Assert
    expect(container.firstElementChild!.getAttribute('aria-hidden')).toBe('true');
  });

  it('deve pulsar só quando o sistema não pede menos movimento', () => {
    // Act
    const { container } = render(<Skeleton />);

    // Assert
    expect(container.firstElementChild!.className).toContain('motion-safe:animate-pulse');
  });

  it('deve aceitar classes extras quando className é informado', () => {
    // Act
    const { container } = render(<Skeleton className="h-20" />);

    // Assert
    expect(container.firstElementChild!.className).toContain('h-20');
  });
});
