/**
 * @vitest-environment jsdom
 */
import { cleanup, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ApiError } from '@/shared/api/apiError';

const NOME_DO_LOGO = 'Rei Auto Parts';
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
  it('deve mostrar o nome do produto como título quando a tela de entrada é aberta', () => {
    // Act
    const { tela } = montar();

    // Assert
    expect(tela.getByRole('heading', { level: 1 }).textContent).toBe(NOME_DO_LOGO);
  });

  it('deve usar um exemplo neutro de e-mail quando a tela de entrada é aberta', () => {
    // Act
    const { tela } = montar();

    // Assert
    expect(tela.getByLabelText('E-mail').getAttribute('placeholder')).toBe('nome@empresa.com');
  });

  it('deve dar o foco ao e-mail quando a tela de entrada é aberta', async () => {
    // Act
    const { tela } = montar();

    // Assert
    await waitFor(() => expect(document.activeElement).toBe(tela.getByLabelText('E-mail')));
  });

  it('deve pedir o teclado de e-mail e o próximo campo quando a tela de entrada é aberta', () => {
    // Act
    const { tela } = montar();

    // Assert
    const email = tela.getByLabelText('E-mail');
    expect([email.getAttribute('inputmode'), email.getAttribute('enterkeyhint')]).toEqual([
      'email',
      'next',
    ]);
  });

  it('deve mostrar a senha digitada quando Mostrar senha é acionado', async () => {
    // Arrange
    const { tela } = montar();
    await userEvent.type(tela.getByLabelText('Senha'), 'segredo123');

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Mostrar senha' }));

    // Assert
    expect(tela.getByLabelText('Senha').getAttribute('type')).toBe('text');
  });

  it.each([
    {
      caso: 'o excesso de tentativas',
      erro: new ApiError({ status: 429, message: 'Too Many Requests' }),
      mensagem: 'Muitas tentativas. Tente de novo em 1 minuto.',
    },
    {
      caso: 'a falta de conexão',
      erro: new TypeError('Failed to fetch'),
      mensagem: 'Sem conexão com o servidor. Verifique sua rede e tente de novo.',
    },
  ])('deve dizer $caso com um alerta quando o login falha assim', async ({ erro, mensagem }) => {
    // Arrange
    const { AppWrapper } = createAppWrapper({
      user: null,
      authOverrides: { login: vi.fn().mockRejectedValue(erro) },
    });
    const { container } = render(<LoginPage />, { wrapper: AppWrapper });
    const tela = within(container);
    await userEvent.type(tela.getByLabelText('E-mail'), 'a@a.com');
    await userEvent.type(tela.getByLabelText('Senha'), 'segredo123');

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Entrar' }));

    // Assert
    expect((await tela.findByRole('alert')).textContent).toBe(mensagem);
  });
});
