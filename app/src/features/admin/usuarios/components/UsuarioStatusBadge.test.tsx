/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UsuarioStatusBadge } from './UsuarioStatusBadge';

describe('UsuarioStatusBadge', () => {
  it('renders active status label', () => {
    render(<UsuarioStatusBadge ativo />);

    expect(screen.getByText('Ativo')).toBeDefined();
  });
});
