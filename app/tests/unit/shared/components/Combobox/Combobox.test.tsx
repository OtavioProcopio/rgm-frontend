/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Combobox } from '@/shared/components/Combobox/Combobox';

const mockOptions = [
  { value: '1', label: 'Opção 1', subLabel: 'Sub 1' },
  { value: '2', label: 'Opção 2', subLabel: 'Sub 2' },
  { value: '3', label: 'Opção 3' },
];

afterEach(cleanup);

describe('Combobox', () => {
  it('renders label and placeholder', () => {
    render(
      <Combobox
        label="Meu Combobox"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        placeholder="Busque aqui..."
      />
    );

    expect(screen.getByLabelText('Meu Combobox')).toBeDefined();
    expect(screen.getByPlaceholderText('Busque aqui...')).toBeDefined();
  });

  it('renders with selected value', () => {
    render(
      <Combobox
        label="Meu Combobox"
        value="2"
        onChange={vi.fn()}
        options={mockOptions}
      />
    );

    const input = screen.getByLabelText('Meu Combobox') as HTMLInputElement;
    expect(input.value).toBe('Opção 2');
  });

  it('opens dropdown and displays all options on focus', async () => {
    render(
      <Combobox
        label="Meu Combobox"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
      />
    );

    const input = screen.getByLabelText('Meu Combobox');
    fireEvent.focus(input);

    expect(screen.getByText('Opção 1')).toBeDefined();
    expect(screen.getByText('Sub 1')).toBeDefined();
    expect(screen.getByText('Opção 2')).toBeDefined();
    expect(screen.getByText('Sub 2')).toBeDefined();
    expect(screen.getByText('Opção 3')).toBeDefined();
  });

  it('filters options based on search query', async () => {
    render(
      <Combobox
        label="Meu Combobox"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
      />
    );

    const input = screen.getByLabelText('Meu Combobox');
    fireEvent.focus(input);
    
    await userEvent.type(input, 'Opção 1');

    expect(screen.getByText('Opção 1')).toBeDefined();
    expect(screen.queryByText('Opção 2')).toBeNull();
  });

  it('calls onChange and closes dropdown when option is clicked', async () => {
    const onChange = vi.fn();
    render(
      <Combobox
        label="Meu Combobox"
        value=""
        onChange={onChange}
        options={mockOptions}
      />
    );

    const input = screen.getByLabelText('Meu Combobox');
    fireEvent.focus(input);

    const optionButton = screen.getByText('Opção 1');
    fireEvent.click(optionButton);

    expect(onChange).toHaveBeenCalledWith('1');
    expect(screen.queryByText('Opção 2')).toBeNull();
  });

  it('clears selection when clear button is clicked', () => {
    const onChange = vi.fn();
    render(
      <Combobox
        label="Meu Combobox"
        value="2"
        onChange={onChange}
        options={mockOptions}
      />
    );

    // Let's find button with X icon or close class
    const buttons = screen.getAllByRole('button');
    // Button with X icon is the first one (value is selected, so we have clear and chevron buttons)
    expect(buttons.length).toBe(2);
    fireEvent.click(buttons[0]);

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('toggles dropdown when chevron is clicked', () => {
    render(
      <Combobox
        label="Meu Combobox"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
      />
    );

    const buttons = screen.getAllByRole('button');
    // Just click chevron button (only button when value is empty)
    expect(buttons.length).toBe(1);
    fireEvent.click(buttons[0]);

    expect(screen.getByText('Opção 1')).toBeDefined();

    fireEvent.click(buttons[0]);
    expect(screen.queryByText('Opção 1')).toBeNull();
  });

  it('shows no results message when filter yields no options', async () => {
    render(
      <Combobox
        label="Meu Combobox"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
      />
    );

    const input = screen.getByLabelText('Meu Combobox');
    fireEvent.focus(input);
    await userEvent.type(input, 'Nonexistent option');

    expect(screen.getByText('Nenhum modelo encontrado')).toBeDefined();
  });

  it('closes dropdown when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Fora</div>
        <Combobox
          label="Meu Combobox"
          value=""
          onChange={vi.fn()}
          options={mockOptions}
        />
      </div>
    );

    const input = screen.getByLabelText('Meu Combobox');
    fireEvent.focus(input);
    expect(screen.getByText('Opção 1')).toBeDefined();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText('Opção 1')).toBeNull();
  });

  it('keeps dropdown open when clicking inside', () => {
    render(
      <Combobox
        label="Meu Combobox"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
      />,
    );

    const input = screen.getByLabelText('Meu Combobox');
    fireEvent.focus(input);
    expect(screen.getByText('Opção 1')).toBeDefined();

    fireEvent.mouseDown(input);
    expect(screen.getByText('Opção 1')).toBeDefined();
  });

  it('closes dropdown with reset to selected when clicking outside with a value', () => {
    render(
      <div>
        <div data-testid="outside2">Fora2</div>
        <Combobox
          label="Meu Combobox"
          value="1"
          onChange={vi.fn()}
          options={mockOptions}
        />
      </div>,
    );

    const input = screen.getByLabelText('Meu Combobox') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.mouseDown(screen.getByTestId('outside2'));
    expect(input.value).toBe('Opção 1');
  });

  it('shows validation error message when error prop is provided', () => {
    render(
      <Combobox
        label="Meu Combobox"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        error="Campo obrigatório"
      />
    );

    expect(screen.getByText('Campo obrigatório')).toBeDefined();
  });

  it('deve associar a mensagem de erro ao campo quando há erro', () => {
    const { container } = render(
      <Combobox
        label="Modelo"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        error="Campo obrigatório"
      />
    );

    const campo = container.querySelector('input')!;
    const descricao = container.ownerDocument.getElementById(
      campo.getAttribute('aria-describedby')!,
    );

    expect(descricao?.textContent).toBe('Campo obrigatório');
  });

  it('deve deixar o campo sem descrição associada quando não há erro', () => {
    const { container } = render(
      <Combobox label="Modelo" value="" onChange={vi.fn()} options={mockOptions} />
    );

    expect(container.querySelector('input')!.hasAttribute('aria-describedby')).toBe(false);
  });

  it('deve dar nome ao botão que limpa a seleção quando há valor selecionado', () => {
    // Act
    render(<Combobox label="Modelo" value="1" onChange={vi.fn()} options={mockOptions} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Limpar seleção' })).toBeDefined();
  });

  it('deve dizer que mostra as opções quando a lista está fechada', () => {
    // Act
    render(<Combobox label="Modelo" value="" onChange={vi.fn()} options={mockOptions} />);

    // Assert
    const botao = screen.getByRole('button', { name: 'Mostrar opções' });
    expect(botao.getAttribute('aria-expanded')).toBe('false');
  });

  it('deve dizer que oculta as opções quando a lista está aberta', async () => {
    // Arrange
    render(<Combobox label="Modelo" value="" onChange={vi.fn()} options={mockOptions} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar opções' }));

    // Assert
    const botao = screen.getByRole('button', { name: 'Ocultar opções' });
    expect(botao.getAttribute('aria-expanded')).toBe('true');
  });

  it('deve deixar todo botão só de ícone com nome acessível e área de toque', () => {
    // Act
    render(<Combobox label="Modelo" value="1" onChange={vi.fn()} options={mockOptions} />);

    // Assert
    const botoes = screen.getAllByRole('button');
    expect(botoes.every((botao) => botao.getAttribute('aria-label'))).toBe(true);
    expect(botoes.every((botao) => botao.className.includes('pointer-coarse:min-h-11'))).toBe(true);
    expect(botoes.every((botao) => botao.className.includes('pointer-coarse:min-w-11'))).toBe(true);
  });
});

describe('Combobox — busca externa', () => {
  const DA_BUSCA = [
    { value: '7', label: 'MD-120 - Tambor' },
    { value: '8', label: 'MD-121 - Flange' },
  ];

  function montar(extra: Partial<Parameters<typeof Combobox>[0]> = {}) {
    const onSearchChange = vi.fn();
    render(
      <div>
        <div data-testid="fora">Fora</div>
        <Combobox
          label="Modelo"
          value=""
          onChange={vi.fn()}
          options={DA_BUSCA}
          onSearchChange={onSearchChange}
          {...extra}
        />
      </div>,
    );
    return { onSearchChange, campo: screen.getByLabelText('Modelo') as HTMLInputElement };
  }

  it('deve avisar o termo digitado a quem faz a busca', async () => {
    // Arrange
    const { onSearchChange, campo } = montar();

    // Act
    await userEvent.type(campo, 'MD-12');

    // Assert
    expect(onSearchChange).toHaveBeenLastCalledWith('MD-12');
  });

  it('deve mostrar as opções recebidas sem filtrá-las pelo termo digitado', async () => {
    // Arrange
    const { campo } = montar();

    // Act
    await userEvent.type(campo, 'texto que não está em nenhuma opção');

    // Assert
    expect(screen.getAllByRole('button', { name: /^MD-12/ })).toHaveLength(2);
  });

  it('deve pedir a busca sem termo quando o campo recebe o foco', () => {
    // Arrange
    const { onSearchChange, campo } = montar();

    // Act
    fireEvent.focus(campo);

    // Assert
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('deve mostrar o rótulo do modelo selecionado mesmo quando ele não está entre as opções da busca', () => {
    // Act
    const { campo } = montar({
      value: '99',
      selectedOption: { value: '99', label: 'MD-999 - Caixa' },
    });

    // Assert
    expect(campo.value).toBe('MD-999 - Caixa');
  });

  it('deve continuar mostrando o selecionado quando o usuário busca outra coisa e fecha sem escolher', async () => {
    // Arrange
    const { campo } = montar({
      value: '99',
      selectedOption: { value: '99', label: 'MD-999 - Caixa' },
    });
    await userEvent.type(campo, 'MD-12');

    // Act
    fireEvent.mouseDown(screen.getByTestId('fora'));

    // Assert
    expect(campo.value).toBe('MD-999 - Caixa');
  });

  it('deve dizer "Buscando..." quando a busca está em andamento e ainda não há opções', () => {
    // Arrange
    const { campo } = montar({ options: [], loading: true });

    // Act
    fireEvent.focus(campo);

    // Assert
    expect(screen.getByText('Buscando...')).toBeDefined();
  });

  it('deve dizer que nada foi encontrado quando a busca terminou sem opções', () => {
    // Arrange
    const { campo } = montar({ options: [], loading: false });

    // Act
    fireEvent.focus(campo);

    // Assert
    expect(screen.getByText('Nenhum modelo encontrado')).toBeDefined();
  });
});
