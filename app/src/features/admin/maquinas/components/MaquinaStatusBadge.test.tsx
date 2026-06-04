/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MaquinaStatusBadge } from './MaquinaStatusBadge';

describe('MaquinaStatusBadge', () => {
  it('renders inactive label', () => {
    render(<MaquinaStatusBadge ativa={false} />);

    expect(screen.getByText('Inativa')).toBeDefined();
  });
});
