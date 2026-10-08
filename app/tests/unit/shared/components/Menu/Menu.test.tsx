/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Menu, MenuItem, MenuLink, MenuSeparator, MenuTitulo } from '@/shared/components/Menu/Menu';

afterEach(cleanup);

type Aberto = { aoEscolher: ReturnType<typeof vi.fn<() => void>> };

function renderizar(itens?: React.ReactNode): Aberto {
  const aoEscolher = vi.fn<() => void>();
  render(
    <MemoryRouter>
      <button type="button">antes</button>
      <Menu rotuloDoMenu="Ações" rotuloDoBotao="Abrir ações" botao="Abrir">
        {itens ?? (
          <>
            <MenuItem onSelect={aoEscolher}>Primeira</MenuItem>
            <MenuItem onSelect={aoEscolher}>Segunda</MenuItem>
            <MenuItem onSelect={aoEscolher}>Terceira</MenuItem>
          </>
        )}
      </Menu>
      <button type="button">depois</button>
    </MemoryRouter>,
  );
  return { aoEscolher };
}

const botao = () => screen.getByRole('button', { name: 'Abrir ações' });
const menu = () => screen.getByRole('menu', { name: 'Ações' });
const item = (nome: string) => screen.getByRole('menuitem', { name: nome });

function abrir() {
  fireEvent.click(botao());
}

describe('Menu', () => {
  it('deve anunciar menu fechado quando ainda não foi aberto', () => {
    // Arrange
    renderizar();

    // Act
    const atributos = [
      botao().getAttribute('aria-haspopup'),
      botao().getAttribute('aria-expanded'),
    ];

    // Assert
    expect(atributos).toEqual(['menu', 'false']);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('deve anunciar menu aberto quando o botão é acionado', () => {
    // Arrange
    renderizar();

    // Act
    abrir();

    // Assert
    expect(botao().getAttribute('aria-expanded')).toBe('true');
    expect(menu()).toBeDefined();
  });

  it('deve focar o primeiro item quando abre', () => {
    // Arrange
    renderizar();

    // Act
    abrir();

    // Assert
    expect(document.activeElement).toBe(item('Primeira'));
  });

  it('deve focar o item marcado quando abre com uma escolha única já feita', () => {
    // Arrange
    renderizar(
      <>
        <MenuItem escolhaUnica marcado={false}>
          Um
        </MenuItem>
        <MenuItem escolhaUnica marcado>
          Dois
        </MenuItem>
      </>,
    );

    // Act
    abrir();

    // Assert
    expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'Dois' }));
  });

  it('deve abrir e focar o primeiro item quando a seta para baixo é apertada no botão', () => {
    // Arrange
    renderizar();

    // Act
    fireEvent.keyDown(botao(), { key: 'ArrowDown' });

    // Assert
    expect(document.activeElement).toBe(item('Primeira'));
  });

  it('deve ir ao item seguinte quando aperta seta para baixo', () => {
    // Arrange
    renderizar();
    abrir();

    // Act
    fireEvent.keyDown(item('Primeira'), { key: 'ArrowDown' });

    // Assert
    expect(document.activeElement).toBe(item('Segunda'));
  });

  it('deve voltar ao primeiro item quando aperta seta para baixo no último', () => {
    // Arrange
    renderizar();
    abrir();
    item('Terceira').focus();

    // Act
    fireEvent.keyDown(item('Terceira'), { key: 'ArrowDown' });

    // Assert
    expect(document.activeElement).toBe(item('Primeira'));
  });

  it('deve ir ao último item quando aperta seta para cima no primeiro', () => {
    // Arrange
    renderizar();
    abrir();

    // Act
    fireEvent.keyDown(item('Primeira'), { key: 'ArrowUp' });

    // Assert
    expect(document.activeElement).toBe(item('Terceira'));
  });

  it('deve ir ao primeiro item quando aperta Home', () => {
    // Arrange
    renderizar();
    abrir();
    item('Segunda').focus();

    // Act
    fireEvent.keyDown(item('Segunda'), { key: 'Home' });

    // Assert
    expect(document.activeElement).toBe(item('Primeira'));
  });

  it('deve ir ao último item quando aperta End', () => {
    // Arrange
    renderizar();
    abrir();

    // Act
    fireEvent.keyDown(item('Primeira'), { key: 'End' });

    // Assert
    expect(document.activeElement).toBe(item('Terceira'));
  });

  it('deve executar a ação e fechar quando o item é clicado', () => {
    // Arrange
    const { aoEscolher } = renderizar();
    abrir();

    // Act
    fireEvent.click(item('Segunda'));

    // Assert
    expect(aoEscolher).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(botao());
  });

  it('deve fechar e devolver o foco ao botão quando aperta Esc sem executar nada', () => {
    // Arrange
    const { aoEscolher } = renderizar();
    abrir();

    // Act
    fireEvent.keyDown(item('Primeira'), { key: 'Escape' });

    // Assert
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(botao());
    expect(aoEscolher).not.toHaveBeenCalled();
  });

  it('deve fechar quando aperta Tab', () => {
    // Arrange
    renderizar();
    abrir();

    // Act
    fireEvent.keyDown(item('Primeira'), { key: 'Tab' });

    // Assert
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('deve fechar quando clica fora do menu', () => {
    // Arrange
    renderizar();
    abrir();

    // Act
    fireEvent.mouseDown(screen.getByRole('button', { name: 'depois' }));

    // Assert
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('deve manter aberto quando clica dentro do menu fora de um item', () => {
    // Arrange
    renderizar(
      <>
        <MenuTitulo>Maria</MenuTitulo>
        <MenuItem>Um</MenuItem>
      </>,
    );
    abrir();

    // Act
    fireEvent.mouseDown(screen.getByText('Maria'));

    // Assert
    expect(menu()).toBeDefined();
  });

  it('deve executar a terceira ação quando desce duas vezes e aciona o item focado', () => {
    // Arrange
    const aoEscolherTerceira = vi.fn<() => void>();
    renderizar(
      <>
        <MenuItem onSelect={vi.fn()}>Primeira</MenuItem>
        <MenuItem onSelect={vi.fn()}>Segunda</MenuItem>
        <MenuItem onSelect={aoEscolherTerceira}>Terceira</MenuItem>
      </>,
    );
    abrir();

    // Act
    fireEvent.keyDown(item('Primeira'), { key: 'ArrowDown' });
    fireEvent.keyDown(item('Segunda'), { key: 'ArrowDown' });
    fireEvent.click(document.activeElement as HTMLElement);

    // Assert
    expect(aoEscolherTerceira).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('deve navegar e fechar quando o item é um link', () => {
    // Arrange
    renderizar(<MenuLink to="/app/perfil">Meu perfil</MenuLink>);
    abrir();

    // Act
    fireEvent.click(item('Meu perfil'));

    // Assert
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('deve apontar o link para o destino quando o item é um link', () => {
    // Arrange
    renderizar(<MenuLink to="/app/perfil">Meu perfil</MenuLink>);

    // Act
    abrir();

    // Assert
    expect(item('Meu perfil').getAttribute('href')).toBe('/app/perfil');
  });

  it('deve acionar o link quando aperta Espaço nele', () => {
    // Arrange
    renderizar(<MenuLink to="/app/perfil">Meu perfil</MenuLink>);
    abrir();
    const clique = vi.fn((evento: Event) => evento.preventDefault());
    item('Meu perfil').addEventListener('click', clique);

    // Act
    fireEvent.keyDown(item('Meu perfil'), { key: ' ' });

    // Assert
    expect(clique).toHaveBeenCalledTimes(1);
  });

  it('deve marcar a opção ativa quando o item é de escolha única', () => {
    // Arrange
    renderizar(
      <>
        <MenuItem escolhaUnica marcado>
          Claro
        </MenuItem>
        <MenuItem escolhaUnica marcado={false}>
          Escuro
        </MenuItem>
      </>,
    );

    // Act
    abrir();

    // Assert
    expect(screen.getByRole('menuitemradio', { name: 'Claro' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(screen.getByRole('menuitemradio', { name: 'Escuro' }).getAttribute('aria-checked')).toBe(
      'false',
    );
  });

  it('deve usar a cor de perigo quando o item é perigoso', () => {
    // Arrange
    renderizar(<MenuItem perigo>Desativar</MenuItem>);

    // Act
    abrir();

    // Assert
    expect(item('Desativar').className).toContain('text-danger-fg');
  });

  it('deve separar os grupos quando há um separador', () => {
    // Arrange
    renderizar(
      <>
        <MenuItem>Um</MenuItem>
        <MenuSeparator />
        <MenuItem perigo>Dois</MenuItem>
      </>,
    );

    // Act
    abrir();

    // Assert
    expect(screen.getByRole('separator')).toBeDefined();
  });

  it('deve pular o item desabilitado quando percorre com as setas', () => {
    // Arrange
    renderizar(
      <>
        <MenuItem>Um</MenuItem>
        <MenuItem desabilitado>Dois</MenuItem>
        <MenuItem>Três</MenuItem>
      </>,
    );
    abrir();

    // Act
    fireEvent.keyDown(item('Um'), { key: 'ArrowDown' });

    // Assert
    expect(document.activeElement).toBe(item('Três'));
  });

  it('deve não executar nada quando o item desabilitado é clicado', () => {
    // Arrange
    const aoEscolher = vi.fn<() => void>();
    renderizar(
      <MenuItem desabilitado onSelect={aoEscolher}>
        Dois
      </MenuItem>,
    );
    abrir();

    // Act
    fireEvent.click(item('Dois'));

    // Assert
    expect(aoEscolher).not.toHaveBeenCalled();
  });

  it('deve ter alvo de toque de 44 px quando o aparelho é de toque', () => {
    // Arrange
    renderizar();

    // Act
    abrir();

    // Assert
    expect(botao().className).toContain('pointer-coarse:min-h-11');
    expect(item('Primeira').className).toContain('pointer-coarse:min-h-11');
  });

  it('deve não animar quando o sistema pede redução de movimento', () => {
    // Arrange
    renderizar();

    // Act
    abrir();

    // Assert
    const classes = menu().className.split(' ');
    const animadas = classes.filter(
      (classe) => /(^|:)(animate|transition)/.test(classe) && !classe.startsWith('motion-safe:'),
    );
    expect(animadas).toEqual([]);
  });
});
