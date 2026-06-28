/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { NovoModeloPage } from './NovoModeloPage';

vi.mock('../hooks/useCriarModelo', () => ({
  useCriarModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({ id: '123' }), isPending: false }),
}));
vi.mock('../hooks/useUploadFotoCapa', () => ({
  useUploadFotoCapa: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../components/ModeloForm', () => ({
  ModeloForm: ({ onSubmit }: { onSubmit: (v: unknown, photo: File | null) => void }) => (
    <button onClick={() => onSubmit({ codigo: 'M01' }, null)}>Salvar</button>
  ),
}));

afterEach(cleanup);

describe('NovoModeloPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Novo modelo')).toBeDefined();
  });

  it('renders form', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoModeloPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('button', { name: 'Salvar' })).toBeDefined();
  });
});
