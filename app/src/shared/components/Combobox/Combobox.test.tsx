/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Combobox } from './Combobox';

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
});
