/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Input } from '@/shared/components/Input/Input';

afterEach(cleanup);

describe('Input', () => {
  it('renders label and input', () => {
    const { container } = render(<Input label="Nome" />);
    expect(within(container).getByLabelText('Nome')).toBeDefined();
  });

  it('associates label with input via generated id', () => {
    const { container } = render(<Input label="Email" />);
    const label = container.querySelector('label')!;
    const input = container.querySelector('input')!;
    expect(label.htmlFor).toBe(input.id);
  });

  it('uses provided id over generated one', () => {
    const { container } = render(<Input label="CPF" id="cpf-field" />);
    expect(container.querySelector('input')!.id).toBe('cpf-field');
  });

  it('renders error message and sets aria-invalid', () => {
    const { container } = render(<Input label="Email" error="E-mail inválido." />);
    expect(within(container).getByText('E-mail inválido.')).toBeDefined();
    expect(container.querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('does not render error element when error is not provided', () => {
    const { container } = render(<Input label="Nome" />);
    expect(container.querySelector('p')).toBeNull();
    expect(container.querySelector('input')!.getAttribute('aria-invalid')).toBe('false');
  });

  it('forwards additional props to native input', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <Input label="Busca" placeholder="Pesquisar..." onChange={onChange} />,
    );
    const input = within(container).getByPlaceholderText('Pesquisar...');
    await userEvent.type(input, 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('deve associar a mensagem de erro ao campo quando há erro', () => {
    const { container } = render(<Input label="Email" error="Campo inválido." />);

    const campo = container.querySelector('input')!;
    const descricao = container.ownerDocument.getElementById(
      campo.getAttribute('aria-describedby')!,
    );

    expect(descricao?.textContent).toBe('Campo inválido.');
  });

  it('deve deixar o campo sem descrição associada quando não há erro', () => {
    const { container } = render(<Input label="Email" />);

    expect(container.querySelector('input')!.hasAttribute('aria-describedby')).toBe(false);
  });

  describe('contador de caracteres', () => {
    const LIMITE = 20;
    const INICIO_DO_AVISO = LIMITE * 0.9;

    function descricoesDoCampo(campo: Element): string[] {
      return (campo.getAttribute('aria-describedby') ?? '')
        .split(' ')
        .filter(Boolean)
        .map((id) => campo.ownerDocument.getElementById(id)?.textContent ?? '');
    }

    it('deve mostrar quantos caracteres restam quando o texto chega a 90% do limite', () => {
      // Arrange
      const { container } = render(<Input label="Título" maxLength={LIMITE} />);
      const campo = container.querySelector('input')!;

      // Act
      fireEvent.change(campo, { target: { value: 'a'.repeat(INICIO_DO_AVISO) } });

      // Assert
      expect(
        within(container).getByText(`Restam ${LIMITE - INICIO_DO_AVISO} caracteres`),
      ).toBeDefined();
    });

    it('deve usar o singular quando resta um caractere', () => {
      // Arrange
      const { container } = render(<Input label="Título" maxLength={LIMITE} />);
      const campo = container.querySelector('input')!;

      // Act
      fireEvent.change(campo, { target: { value: 'a'.repeat(LIMITE - 1) } });

      // Assert
      expect(within(container).getByText('Resta 1 caractere')).toBeDefined();
    });

    it('deve esconder o contador quando o texto fica abaixo de 90% do limite', () => {
      // Arrange
      const { container } = render(<Input label="Título" maxLength={LIMITE} />);
      const campo = container.querySelector('input')!;
      fireEvent.change(campo, { target: { value: 'a'.repeat(INICIO_DO_AVISO) } });

      // Act
      fireEvent.change(campo, { target: { value: 'a'.repeat(INICIO_DO_AVISO - 1) } });

      // Assert
      expect(within(container).queryByText(/^Resta/)).toBeNull();
    });

    it('deve ficar sem contador quando o campo não tem limite', () => {
      // Arrange
      const { container } = render(<Input label="Título" />);
      const campo = container.querySelector('input')!;

      // Act
      fireEvent.change(campo, { target: { value: 'a'.repeat(LIMITE) } });

      // Assert
      expect(within(container).queryByText(/^Resta/)).toBeNull();
    });

    it('deve contar o valor recebido quando o campo é controlado', () => {
      // Arrange
      const valor = 'a'.repeat(LIMITE);

      // Act
      const { container } = render(
        <Input label="Título" maxLength={LIMITE} value={valor} onChange={() => undefined} />,
      );

      // Assert
      expect(within(container).getByText('Restam 0 caracteres')).toBeDefined();
    });

    it('deve associar o contador ao campo quando ele aparece', () => {
      // Arrange
      const { container } = render(<Input label="Título" maxLength={LIMITE} />);
      const campo = container.querySelector('input')!;

      // Act
      fireEvent.change(campo, { target: { value: 'a'.repeat(INICIO_DO_AVISO) } });

      // Assert
      expect(descricoesDoCampo(campo)).toEqual([`Restam ${LIMITE - INICIO_DO_AVISO} caracteres`]);
    });

    it('deve associar o erro e o contador ao campo quando os dois aparecem', () => {
      // Arrange
      const erro = 'Campo inválido.';
      const { container } = render(<Input label="Título" maxLength={LIMITE} error={erro} />);
      const campo = container.querySelector('input')!;

      // Act
      fireEvent.change(campo, { target: { value: 'a'.repeat(LIMITE) } });

      // Assert
      expect(descricoesDoCampo(campo)).toEqual([erro, 'Restam 0 caracteres']);
    });

    it('deve repassar a digitação a quem usa o campo quando há limite', () => {
      // Arrange
      const onChange = vi.fn();
      const { container } = render(<Input label="Título" maxLength={LIMITE} onChange={onChange} />);
      const campo = container.querySelector('input')!;

      // Act
      fireEvent.change(campo, { target: { value: 'a' } });

      // Assert
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
