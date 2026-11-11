/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FiltrosDoCatalogo } from '@/features/modelos/components/FiltrosDoCatalogo';
import { botoesDoCatalogo } from '@/features/modelos/lib/botoesDoCatalogo';

afterEach(cleanup);

function montar(extra: Partial<React.ComponentProps<typeof FiltrosDoCatalogo>> = {}) {
  const props = {
    tipos: botoesDoCatalogo(
      'Todos',
      [
        { valor: 'RESINA', rotulo: 'Resina' },
        { valor: 'COQUILHA_ACO', rotulo: 'Coquilha em Aço' },
      ],
      new Map([['RESINA', 3]]),
      '',
    ),
    maquinas: botoesDoCatalogo(
      'Todas',
      [
        { valor: 'FBOX', rotulo: 'FBOX' },
        { valor: 'LINHA 2', rotulo: 'LINHA 2' },
      ],
      new Map([['FBOX', 3]]),
      'FBOX',
    ),
    onTipo: vi.fn(),
    onMaquina: vi.fn(),
    busca: '',
    onBusca: vi.fn(),
    buscaCurta: false,
    inativos: false,
    onInativos: vi.fn(),
    temFiltro: false,
    onLimpar: vi.fn(),
    ...extra,
  };
  render(<FiltrosDoCatalogo {...props} />);
  return props;
}

describe('FiltrosDoCatalogo', () => {
  it('deve mostrar os grupos de tipo e de máquina com seus botões', () => {
    // Act
    montar();

    // Assert
    const tipos = screen.getByRole('group', { name: 'Tipo de modelo' });
    expect(
      within(tipos)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Todos', 'Resina 3(3 modelos)', 'Coquilha em Aço 0(0 modelos)']);
    const maquinas = screen.getByRole('group', { name: 'Máquina' });
    expect(within(maquinas).getAllByRole('button')).toHaveLength(3);
  });

  it('deve repassar o clique de cada grupo com o valor do botão', async () => {
    // Arrange
    const { onTipo, onMaquina } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Resina/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Todas' }));

    // Assert
    expect(onTipo).toHaveBeenCalledExactlyOnceWith('RESINA');
    expect(onMaquina).toHaveBeenCalledExactlyOnceWith('');
  });

  it('deve marcar o escolhido e desabilitar o tipo sem modelos', () => {
    montar();

    expect(screen.getByRole('button', { name: /FBOX/ }).getAttribute('aria-pressed')).toBe('true');
    expect((screen.getByRole('button', { name: /Coquilha/ }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('deve mostrar o texto da busca e repassar o que é digitado', async () => {
    // Arrange
    const { onBusca } = montar({ busca: 'mancal' });

    // Act
    await userEvent.type(screen.getByLabelText('Buscar por código ou descrição'), 'x');

    // Assert
    expect(
      (screen.getByLabelText('Buscar por código ou descrição') as HTMLInputElement).value,
    ).toBe('mancal');
    expect(onBusca).toHaveBeenCalledWith('mancalx');
  });

  it('deve mostrar a dica de 2 letras, ligada ao campo, só quando a busca é curta', () => {
    const { unmount } = render(<div />);
    unmount();
    montar({ buscaCurta: true });

    const campo = screen.getByLabelText('Buscar por código ou descrição');
    expect(screen.getByText('Digite ao menos 2 letras')).toBeDefined();
    expect(campo.getAttribute('aria-describedby')).toBe('dica-da-busca');
  });

  it('não deve mostrar a dica quando a busca não é curta', () => {
    montar({ buscaCurta: false });

    expect(screen.queryByText('Digite ao menos 2 letras')).toBeNull();
    expect(
      screen.getByLabelText('Buscar por código ou descrição').getAttribute('aria-describedby'),
    ).toBeNull();
  });

  it('deve alternar "Mostrar inativos"', async () => {
    // Arrange
    const { onInativos } = montar();

    // Act
    await userEvent.click(screen.getByLabelText('Mostrar inativos'));

    // Assert
    expect(onInativos).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('deve mostrar "Limpar filtros" só quando há filtro e chamar a limpeza', async () => {
    // Arrange
    const { onLimpar } = montar({ temFiltro: true });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    // Assert
    expect(onLimpar).toHaveBeenCalledTimes(1);
  });

  it('não deve mostrar "Limpar filtros" quando não há filtro', () => {
    montar({ temFiltro: false });

    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).toBeNull();
  });

  it('deve dar ao campo de busca e ao "Mostrar inativos" alvo de toque de 44 px', () => {
    montar();

    expect(screen.getByLabelText('Buscar por código ou descrição').className).toContain('min-h-11');
    expect(screen.getByLabelText('Mostrar inativos').closest('label')?.className).toContain(
      'min-h-11',
    );
  });
});
