/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBuscaDeModelos } from '@/features/admin/modelos/hooks/useBuscaDeModelos';
import { useModelo } from '@/features/admin/modelos/hooks/useModelo';
import { SeletorDeModelo } from '@/features/solicitacoes/components/SeletorDeModelo';

vi.mock('@/features/admin/modelos/hooks/useBuscaDeModelos', () => ({
  useBuscaDeModelos: vi.fn(),
}));
vi.mock('@/features/admin/modelos/hooks/useModelo', () => ({
  useModelo: vi.fn(),
}));

const DA_BUSCA = [
  { id: 'm-121', codigo: 'MD-121', descricao: 'Flange', maquina: 'FBOX' },
  { id: 'm-122', codigo: 'MD-122', descricao: 'Mancal', maquina: 'DISA' },
];
const SELECIONADO = { id: 'm-120', codigo: 'MD-120', descricao: 'Tambor', maquina: 'DISA' };

beforeEach(() => {
  vi.mocked(useBuscaDeModelos).mockReturnValue({ modelos: DA_BUSCA, buscando: false } as ReturnType<
    typeof useBuscaDeModelos
  >);
  vi.mocked(useModelo).mockReturnValue({ data: undefined } as ReturnType<typeof useModelo>);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function montar(value = '') {
  const onChange = vi.fn();
  render(
    <div>
      <div data-testid="fora">Fora</div>
      <SeletorDeModelo label="Modelo" value={value} onChange={onChange} />
    </div>,
  );
  return { onChange, campo: screen.getByLabelText('Modelo') as HTMLInputElement };
}

function comSelecionado() {
  vi.mocked(useModelo).mockReturnValue({ data: SELECIONADO } as ReturnType<typeof useModelo>);
}

describe('SeletorDeModelo', () => {
  it('deve oferecer como opções os modelos que a busca devolveu', () => {
    // Arrange
    const { campo } = montar();

    // Act
    fireEvent.focus(campo);

    // Assert
    expect(screen.getAllByRole('button', { name: /^MD-12\d - / })).toHaveLength(2);
  });

  it('deve mostrar em cada opção o código, a descrição e a máquina do modelo', () => {
    // Arrange
    const { campo } = montar();

    // Act
    fireEvent.focus(campo);

    // Assert
    expect(screen.getByRole('button', { name: /^MD-121 - Flange\s*FBOX$/ })).toBeDefined();
  });

  it('deve buscar pelo que o usuário digita', async () => {
    // Arrange
    const { campo } = montar();

    // Act
    await userEvent.type(campo, 'MD-12');

    // Assert
    expect(vi.mocked(useBuscaDeModelos).mock.lastCall?.[0]).toBe('MD-12');
  });

  it('deve informar o id do modelo quando uma opção é escolhida', async () => {
    // Arrange
    const { onChange, campo } = montar();
    fireEvent.focus(campo);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /^MD-122/ }));

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('m-122');
  });

  it('deve mostrar o modelo selecionado mesmo quando ele não está entre as opções da busca', () => {
    // Arrange
    comSelecionado();

    // Act
    const { campo } = montar('m-120');

    // Assert
    expect(campo.value).toBe('MD-120 - Tambor');
  });

  it('deve buscar o modelo selecionado pelo id', () => {
    // Arrange
    comSelecionado();

    // Act
    montar('m-120');

    // Assert
    expect(vi.mocked(useModelo).mock.lastCall?.[0]).toBe('m-120');
  });

  it('deve continuar mostrando o selecionado quando o usuário digita outra busca e fecha sem escolher', async () => {
    // Arrange
    comSelecionado();
    const { campo } = montar('m-120');
    await userEvent.type(campo, 'MD-12');

    // Act
    fireEvent.mouseDown(screen.getByTestId('fora'));

    // Assert
    expect(campo.value).toBe('MD-120 - Tambor');
  });

  it('deve informar valor vazio quando a seleção é limpa', async () => {
    // Arrange
    comSelecionado();
    const { onChange } = montar('m-120');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Limpar seleção' }));

    // Assert
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('deve não buscar modelo selecionado quando nenhum foi escolhido', () => {
    // Act
    montar('');

    // Assert
    expect(vi.mocked(useModelo).mock.lastCall?.[0]).toBeUndefined();
  });

  it('deve dizer "Buscando..." enquanto a busca não devolveu opções', () => {
    // Arrange
    vi.mocked(useBuscaDeModelos).mockReturnValue({ modelos: [], buscando: true } as ReturnType<
      typeof useBuscaDeModelos
    >);
    const { campo } = montar();

    // Act
    fireEvent.focus(campo);

    // Assert
    expect(screen.getByText('Buscando...')).toBeDefined();
  });
});
