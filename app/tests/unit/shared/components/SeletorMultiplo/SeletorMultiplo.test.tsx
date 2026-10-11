/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  SeletorMultiplo,
  type OpcaoDoSeletor,
} from '@/shared/components/SeletorMultiplo/SeletorMultiplo';

const OPCOES: OpcaoDoSeletor[] = [
  { valor: 'a', rotulo: 'Ana' },
  { valor: 'b', rotulo: 'Beto' },
];

function montar(extra: Partial<React.ComponentProps<typeof SeletorMultiplo>> = {}) {
  const onChange = vi.fn();
  const onBuscar = vi.fn();
  render(
    <SeletorMultiplo
      rotulo="Responsáveis"
      escolhidas={[]}
      opcoes={OPCOES}
      onChange={onChange}
      onBuscar={onBuscar}
      {...extra}
    />,
  );
  return { onChange, onBuscar };
}

afterEach(cleanup);

describe('SeletorMultiplo', () => {
  it('deve repassar o termo à busca quando o usuário digita', async () => {
    // Arrange
    const { onBuscar } = montar();

    // Act
    await userEvent.type(screen.getByLabelText('Responsáveis'), 'be');

    // Assert
    expect(onBuscar).toHaveBeenLastCalledWith('be');
  });

  it('deve acrescentar a opção e limpar a busca quando a opção é tocada', async () => {
    // Arrange
    const { onChange, onBuscar } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Beto' }));

    // Assert
    expect(onChange).toHaveBeenCalledWith([{ valor: 'b', rotulo: 'Beto' }]);
    expect(onBuscar).toHaveBeenLastCalledWith('');
  });

  it('deve esconder das opções as já escolhidas quando há etiquetas', () => {
    // Arrange
    const escolhidas = [{ valor: 'a', rotulo: 'Ana' }];

    // Act
    montar({ escolhidas });

    // Assert
    expect(screen.queryByRole('button', { name: 'Ana' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Beto' })).toBeDefined();
  });

  it('deve remover a etiqueta quando o botão de remover é acionado', async () => {
    // Arrange
    const escolhidas = [
      { valor: 'a', rotulo: 'Ana' },
      { valor: 'b', rotulo: 'Beto' },
    ];
    const { onChange } = montar({ escolhidas, opcoes: [] });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Remover Ana' }));

    // Assert
    expect(onChange).toHaveBeenCalledWith([{ valor: 'b', rotulo: 'Beto' }]);
  });

  it('deve dizer que está buscando quando não há opção e a busca está em andamento', () => {
    // Act
    montar({ opcoes: [], carregando: true });

    // Assert
    expect(screen.getByText('Buscando...')).toBeDefined();
  });

  it('deve mostrar o texto sem resultado quando não há opção', () => {
    // Act
    montar({ opcoes: [], textoSemResultado: 'Ninguém encontrado.' });

    // Assert
    expect(screen.getByText('Ninguém encontrado.')).toBeDefined();
  });

  it('deve mostrar o erro quando ele é informado', () => {
    // Act
    montar({ erro: 'Selecione ao menos um responsável' });

    // Assert
    expect(screen.getByText('Selecione ao menos um responsável')).toBeDefined();
  });
});
