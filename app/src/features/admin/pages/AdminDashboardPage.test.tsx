/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { AdminDashboardPage } from './AdminDashboardPage';

afterEach(cleanup);

describe('AdminDashboardPage', () => {
  it('renders admin panel title', () => {
    const { container } = render(
      <MemoryRouter><AdminDashboardPage /></MemoryRouter>,
    );
    expect(within(container).getByText(/painel administrativo/i)).toBeDefined();
  });

  it('renders Usuários and Modelos cards', () => {
    const { container } = render(
      <MemoryRouter><AdminDashboardPage /></MemoryRouter>,
    );
    expect(within(container).getByText('Usuários')).toBeDefined();
    expect(within(container).getByText('Modelos')).toBeDefined();
  });
});
