/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { LoginPage } from '@/features/auth/pages/LoginPage';

const NOME_DO_LOGO = 'RGM Auto Parts';
const PLACA_DO_LOGO = 'bg-logo-plate';
const PAPEIS_DO_CARTAO = ['bg-surface', 'border-line'];
const PAPEIS_DO_CAMPO = ['bg-surface', 'text-fg', 'border-line-strong'];
const PAPEL_DO_ROTULO = 'text-fg';
const REDEFINICAO_DE_FOCO = '[--foco:';
const VARIANTE_ESCURA = 'dark:';
const CAMPOS = [{ rotulo: 'E-mail' }, { rotulo: 'Senha' }] as const;

const classes = (elemento: Element) => elemento.className.split(' ');
const comPrefixo = (elemento: Element, prefixo: string) =>
  classes(elemento).filter((classe) => classe.startsWith(prefixo));

function montar() {
  const { AppWrapper } = createAppWrapper({ user: null });
  const { container } = render(<LoginPage />, { wrapper: AppWrapper });
  return { cartao: container.firstElementChild!, tela: within(container) };
}

afterEach(cleanup);

describe('LoginPage', () => {
  it('deve mostrar o logo sobre a placa do papel logo-plate quando a tela de entrada é aberta', () => {
    // Act
    const { tela } = montar();

    // Assert
    const logo = tela.getByRole('img', { name: NOME_DO_LOGO });
    expect(classes(logo.parentElement!)).toContain(PLACA_DO_LOGO);
  });

  it('deve usar a superfície e a borda do tema no cartão quando a tela de entrada é aberta', () => {
    // Act
    const { cartao } = montar();

    // Assert
    expect(classes(cartao)).toEqual(expect.arrayContaining(PAPEIS_DO_CARTAO));
  });

  it('deve não redefinir a cor de foco no cartão quando a tela de entrada é aberta', () => {
    // Act
    const { cartao } = montar();

    // Assert
    expect(comPrefixo(cartao, REDEFINICAO_DE_FOCO)).toEqual([]);
  });

  it.each(CAMPOS)(
    'deve manter as cores por papel no campo $rotulo quando a tela de entrada é aberta',
    ({ rotulo }) => {
      // Act
      const { tela } = montar();

      // Assert
      expect(classes(tela.getByLabelText(rotulo))).toEqual(expect.arrayContaining(PAPEIS_DO_CAMPO));
    },
  );

  it.each(CAMPOS)(
    'deve não sobrescrever as cores do campo $rotulo quando a tela de entrada é aberta',
    ({ rotulo }) => {
      // Act
      const { tela } = montar();

      // Assert
      expect(comPrefixo(tela.getByLabelText(rotulo), VARIANTE_ESCURA)).toEqual([]);
    },
  );

  it.each(CAMPOS)(
    'deve manter o texto do papel fg no rótulo $rotulo quando a tela de entrada é aberta',
    ({ rotulo }) => {
      // Act
      const { tela } = montar();

      // Assert
      expect(classes(tela.getByText(rotulo))).toContain(PAPEL_DO_ROTULO);
    },
  );

  it.each(CAMPOS)(
    'deve não sobrescrever a cor do rótulo $rotulo quando a tela de entrada é aberta',
    ({ rotulo }) => {
      // Act
      const { tela } = montar();

      // Assert
      expect(comPrefixo(tela.getByText(rotulo), VARIANTE_ESCURA)).toEqual([]);
    },
  );

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
      authOverrides: {
        login: vi.fn().mockRejectedValue(new ApiError({ status: 401, message: 'Unauthorized' })),
      },
    });
    const { container } = render(<LoginPage />, { wrapper: AppWrapper });
    await userEvent.type(within(container).getByLabelText(/e-mail/i), 'a@a.com');
    await userEvent.type(within(container).getByLabelText(/senha/i), 'wrong');
    await userEvent.click(within(container).getByRole('button', { name: /entrar/i }));
    expect(within(container).getByText(/e-mail ou senha inválidos/i)).toBeDefined();
  });
});
