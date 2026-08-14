/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { NovaMaquinaPage } from './NovaMaquinaPage';

vi.mock('../hooks/useCriarMaquina', () => ({
  useCriarMaquina: vi.fn().mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({ id: '1' }),
    isPending: false,
  }),
}));

afterEach(cleanup);

describe('NovaMaquinaPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovaMaquinaPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Nova máquina')).toBeDefined();
  });

  it('renders the form', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovaMaquinaPage />, { wrapper: AppWrapper });
    expect(within(container).getByLabelText(/nome da máquina/i)).toBeDefined();
  });
});
