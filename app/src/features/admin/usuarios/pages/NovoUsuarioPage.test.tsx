/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { NovoUsuarioPage } from './NovoUsuarioPage';

vi.mock('../hooks/useCriarUsuario', () => ({
  useCriarUsuario: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../components/UsuarioForm', () => ({
  UsuarioForm: () => <div data-testid="usuario-form" />,
}));

afterEach(cleanup);

describe('NovoUsuarioPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoUsuarioPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Novo usuário')).toBeDefined();
  });

  it('renders form', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoUsuarioPage />, { wrapper: AppWrapper });
    expect(container.querySelector('[data-testid="usuario-form"]')).toBeDefined();
  });
});
