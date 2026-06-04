/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('renders native button content', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDefined();
  });
});
