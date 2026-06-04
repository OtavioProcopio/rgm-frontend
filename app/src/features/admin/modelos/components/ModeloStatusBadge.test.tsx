/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ModeloStatusBadge } from './ModeloStatusBadge';

describe('ModeloStatusBadge', () => {
  it('renders active label', () => {
    render(<ModeloStatusBadge ativo />);

    expect(screen.getByText('Ativo')).toBeDefined();
  });
});
