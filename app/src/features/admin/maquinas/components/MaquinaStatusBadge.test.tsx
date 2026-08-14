/**
 * @vitest-environment jsdom
 */
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { MaquinaStatusBadge } from './MaquinaStatusBadge';

afterEach(cleanup);

describe('MaquinaStatusBadge', () => {
  it('renders active label', () => {
    const { getByText } = render(<MaquinaStatusBadge ativo />);
    expect(getByText('Ativa')).toBeDefined();
  });

  it('renders inactive label', () => {
    const { getByText } = render(<MaquinaStatusBadge ativo={false} />);
    expect(getByText('Inativa')).toBeDefined();
  });
});
