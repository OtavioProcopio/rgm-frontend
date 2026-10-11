/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { CampoDeSenha } from '@/shared/components/CampoDeSenha/CampoDeSenha';

const ROTULO = 'Senha';

const campo = () => screen.getByLabelText(ROTULO);
const botao = (nome: string) => screen.getByRole('button', { name: nome });

afterEach(cleanup);

describe('CampoDeSenha', () => {
  it('deve esconder o texto digitado quando a tela abre', () => {
    // Act
    render(<CampoDeSenha label={ROTULO} />);

    // Assert
    expect(campo().getAttribute('type')).toBe('password');
  });

  it('deve oferecer Mostrar senha com o estado não pressionado quando a tela abre', () => {
    // Act
    render(<CampoDeSenha label={ROTULO} />);

    // Assert
    expect(botao('Mostrar senha').getAttribute('aria-pressed')).toBe('false');
  });

  it('deve mostrar o texto digitado quando Mostrar senha é acionado', async () => {
    // Arrange
    render(<CampoDeSenha label={ROTULO} />);

    // Act
    await userEvent.click(botao('Mostrar senha'));

    // Assert
    expect(campo().getAttribute('type')).toBe('text');
  });

  it('deve passar a dizer Ocultar senha com o estado pressionado quando o texto é mostrado', async () => {
    // Arrange
    render(<CampoDeSenha label={ROTULO} />);

    // Act
    await userEvent.click(botao('Mostrar senha'));

    // Assert
    expect(botao('Ocultar senha').getAttribute('aria-pressed')).toBe('true');
  });

  it('deve voltar a esconder o texto quando Ocultar senha é acionado', async () => {
    // Arrange
    render(<CampoDeSenha label={ROTULO} />);
    await userEvent.click(botao('Mostrar senha'));

    // Act
    await userEvent.click(botao('Ocultar senha'));

    // Assert
    expect(campo().getAttribute('type')).toBe('password');
  });

  it('deve desabilitar o botão quando o campo está desabilitado', () => {
    // Act
    render(<CampoDeSenha label={ROTULO} disabled />);

    // Assert
    expect(botao('Mostrar senha').hasAttribute('disabled')).toBe(true);
  });

  it('deve manter o que foi digitado quando o texto passa de oculto a visível', async () => {
    // Arrange
    render(<CampoDeSenha label={ROTULO} />);
    await userEvent.type(campo(), 'segredo123');

    // Act
    await userEvent.click(botao('Mostrar senha'));

    // Assert
    expect((campo() as HTMLInputElement).value).toBe('segredo123');
  });
});
