/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { LoginPage } from './LoginPage';

afterEach(cleanup);

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<LoginPage />, { wrapper: AppWrapper });
    expect(within(container).getByLabelText(/e-mail/i)).toBeDefined();
    expect(within(container).getByLabelText(/senha/i)).toBeDefined();
  });

  it('renders submit button', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<LoginPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('button', { name: /entrar/i })).toBeDefined();
  });

  it('shows login error when credentials are wrong', async () => {
    const { ApiError } = await import('@/shared/api/apiError');
    const { AppWrapper } = createAppWrapper({
      user: null,
      authOverrides: { login: vi.fn().mockRejectedValue(new ApiError({ status: 401, message: 'Unauthorized' })) },
    });
    const { container } = render(<LoginPage />, { wrapper: AppWrapper });
    await userEvent.type(within(container).getByLabelText(/e-mail/i), 'a@a.com');
    await userEvent.type(within(container).getByLabelText(/senha/i), 'wrong');
    await userEvent.click(within(container).getByRole('button', { name: /entrar/i }));
    expect(within(container).getByText(/e-mail ou senha inválidos/i)).toBeDefined();
  });
});
