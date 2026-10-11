/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { NovoTipoModeloPage } from '@/features/admin/tiposModelo/pages/NovoTipoModeloPage';

vi.mock('@/features/admin/tiposModelo/hooks/useCriarTipoModelo', () => ({
  useCriarTipoModelo: vi.fn().mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({ id: '1' }),
    isPending: false,
  }),
}));

afterEach(cleanup);

describe('NovoTipoModeloPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoTipoModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Novo tipo de modelo')).toBeDefined();
  });

  it('renders the form', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoTipoModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByLabelText(/nome do tipo de modelo/i)).toBeDefined();
  });
});
