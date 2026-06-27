/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { LoadingState } from './LoadingState';

afterEach(cleanup);

describe('LoadingState', () => {
  it('renders the default title', () => {
    const { container } = render(<LoadingState />);
    expect(within(container).getByText('Carregando...')).toBeDefined();
  });

  it('renders a custom title', () => {
    const { container } = render(<LoadingState title="Carregando usuários..." />);
    expect(within(container).getByText('Carregando usuários...')).toBeDefined();
  });
});
