/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

vi.mock('@/features/admin/modelos/hooks/useCriarModelo', () => ({
  useCriarModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/admin/modelos/components/ModeloForm', () => ({
  ModeloForm: () => <div data-testid="modelo-form" />,
}));

import { NovoModeloPage } from './NovoModeloPage';

afterEach(cleanup);

describe('NovoModeloPage', () => {
  it('renders page header and form', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/novo modelo/i)).toBeDefined();
    expect(within(container).getByTestId('modelo-form')).toBeDefined();
  });

  it('renders link to go back', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/voltar para modelos/i)).toBeDefined();
  });
});
