/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { LinhaDoTempo } from '@/shared/components/LinhaDoTempo/LinhaDoTempo';
import type { ItemDaLinhaDoTempo } from '@/shared/components/LinhaDoTempo/LinhaDoTempo';
import { formatarDataHora } from '@/shared/lib/data';

afterEach(() => cleanup());

const AGORA: Date = new Date(2026, 9, 8, 12, 0, 0);
const AGORA_MS: number = AGORA.getTime();

function emIso(diasAtras: number, hora: number, minuto = 0): string {
  return new Date(2026, 9, 8 - diasAtras, hora, minuto, 0).toISOString();
}

function criarItem(id: string, em: string, extra: Partial<ItemDaLinhaDoTempo> = {}) {
  const item: ItemDaLinhaDoTempo = { id, em, marcador: <span>m</span>, titulo: `Evento ${id}` };
  return { ...item, ...extra };
}

function criarVarios(quantidade: number): ItemDaLinhaDoTempo[] {
  return Array.from({ length: quantidade }, (_: unknown, i: number) =>
    criarItem(`n${i}`, emIso(0, 11, 59 - i)),
  );
}

function renderizar(itens: ItemDaLinhaDoTempo[], vazio?: React.ReactNode) {
  return render(
    <MemoryRouter>
      <LinhaDoTempo itens={itens} rotulo="Histórico" vazio={vazio} agoraMs={AGORA_MS} />
    </MemoryRouter>,
  );
}

describe('LinhaDoTempo', () => {
  it('deve mostrar os grupos Hoje, Ontem e a data do mais recente ao mais antigo quando há eventos em dias distintos', () => {
    // Arrange
    const antigo: string = emIso(5, 9);
    const itens: ItemDaLinhaDoTempo[] = [
      criarItem('a', antigo),
      criarItem('b', emIso(0, 10)),
      criarItem('c', emIso(1, 15)),
    ];

    // Act
    renderizar(itens);

    // Assert
    const titulos: string[] = screen
      .getAllByRole('heading', { level: 3 })
      .map((h: HTMLElement) => h.textContent ?? '');
    const data: string = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(
      new Date(antigo),
    );
    expect(titulos).toEqual(['Hoje', 'Ontem', data]);
  });

  it('deve ordenar do mais recente ao mais antigo quando há vários eventos no mesmo dia', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = [
      criarItem('a', emIso(0, 8)),
      criarItem('b', emIso(0, 11)),
      criarItem('c', emIso(0, 9)),
    ];

    // Act
    renderizar(itens);

    // Assert
    const textos: string[] = screen
      .getAllByRole('listitem')
      .map((li: HTMLElement) => li.textContent ?? '');
    expect(textos[0]).toContain('Evento b');
    expect(textos[1]).toContain('Evento c');
    expect(textos[2]).toContain('Evento a');
  });

  it('deve expor a região com o rótulo recebido quando há eventos', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = [criarItem('a', emIso(0, 10))];

    // Act
    renderizar(itens);

    // Assert
    expect(screen.getByRole('region', { name: 'Histórico' })).toBeTruthy();
  });

  it('deve renderizar o título como link para o destino quando o evento tem destino', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = [criarItem('a', emIso(0, 10), { destino: '/app/x/1' })];

    // Act
    renderizar(itens);

    // Assert
    const link: HTMLElement = screen.getByRole('link', { name: 'Evento a' });
    expect(link.getAttribute('href')).toBe('/app/x/1');
  });

  it('deve dar ao link do título alvo de toque de 44 px quando o evento tem destino', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = [criarItem('a', emIso(0, 10), { destino: '/app/x/1' })];

    // Act
    renderizar(itens);

    // Assert
    const link: HTMLElement = screen.getByRole('link', { name: 'Evento a' });
    expect(link.classList.contains('pointer-coarse:min-h-11')).toBe(true);
    expect(link.classList.contains('inline-flex')).toBe(true);
  });

  it('deve renderizar o título sem link quando o evento não tem destino', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = [criarItem('a', emIso(0, 10), { destino: null })];

    // Act
    renderizar(itens);

    // Assert
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Evento a')).toBeTruthy();
  });

  it('deve mostrar as iniciais ocultas e o nome uma única vez quando o evento tem autor', () => {
    // Arrange
    const autor = { nome: 'Maria Souza', iniciais: 'MS' };
    const itens: ItemDaLinhaDoTempo[] = [criarItem('a', emIso(0, 10), { autor })];

    // Act
    renderizar(itens);

    // Assert
    expect(screen.getAllByText('Maria Souza')).toHaveLength(1);
    expect(screen.getByText('MS').getAttribute('aria-hidden')).toBe('true');
  });

  it('deve usar texto discreto quando o peso é discreto', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = [criarItem('a', emIso(0, 10), { peso: 'discreto' })];

    // Act
    renderizar(itens);

    // Assert
    const titulo: HTMLElement = screen.getByText('Evento a');
    expect(titulo.className).toContain('text-fg-muted');
    expect(titulo.className).toContain('text-xs');
  });

  it('deve usar texto de destaque quando o peso não é informado', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = [criarItem('a', emIso(0, 10))];

    // Act
    renderizar(itens);

    // Assert
    const titulo: HTMLElement = screen.getByText('Evento a');
    expect(titulo.className).toContain('text-fg');
    expect(titulo.className).not.toContain('text-fg-muted');
  });

  it('deve mostrar o detalhe abaixo do título quando o evento tem detalhe', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = [
      criarItem('a', emIso(0, 10), { detalhe: <p>Balão de comentário</p> }),
    ];

    // Act
    renderizar(itens);

    // Assert
    expect(screen.getByText('Balão de comentário')).toBeTruthy();
  });

  it('deve mostrar o horário relativo com a data completa no title e no texto sr-only quando há eventos', () => {
    // Arrange
    const em: string = emIso(0, 10);
    const completa: string = formatarDataHora(em);

    // Act
    const { container } = renderizar([criarItem('a', em)]);

    // Assert
    const horario: HTMLElement = screen.getByText('há 2 h');
    expect(horario.tagName).toBe('TIME');
    expect(horario.getAttribute('datetime')).toBe(em);
    expect(horario.getAttribute('title')).toBe(completa);
    expect(container.querySelector('.sr-only')?.textContent).toBe(completa);
  });

  it('deve mostrar a data completa visível quando o horário é acionado', async () => {
    // Arrange
    const em: string = emIso(0, 10);
    const completa: string = formatarDataHora(em);
    const { container } = renderizar([criarItem('a', em)]);
    const botao: HTMLElement = screen.getByRole('button', { name: /há 2 h/ });

    // Act
    await userEvent.click(botao);

    // Assert
    const visiveis: Element[] = Array.from(container.querySelectorAll('span')).filter(
      (e: Element) => e.textContent === completa && !e.classList.contains('sr-only'),
    );
    expect(visiveis).toHaveLength(1);
    expect(botao.getAttribute('aria-expanded')).toBe('true');
  });

  it('deve mostrar 10 eventos e o botão no singular quando há 11 eventos', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = criarVarios(11);

    // Act
    renderizar(itens);

    // Assert
    expect(screen.getAllByRole('listitem')).toHaveLength(10);
    expect(screen.getByRole('button', { name: 'Mostrar 1 evento anterior' })).toBeTruthy();
  });

  it('deve oferecer o botão no plural quando há 15 eventos', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = criarVarios(15);

    // Act
    renderizar(itens);

    // Assert
    expect(screen.getByRole('button', { name: 'Mostrar 5 eventos anteriores' })).toBeTruthy();
  });

  it('deve mostrar todos mantendo o mesmo botão focado quando o botão é acionado pelo teclado', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar(criarVarios(15));
    const botao: HTMLElement = screen.getByRole('button', { name: /Mostrar 5 eventos/ });
    botao.focus();

    // Act
    await user.keyboard('{Enter}');

    // Assert
    expect(screen.getAllByRole('listitem')).toHaveLength(15);
    expect(botao.isConnected).toBe(true);
    expect(botao.textContent).toBe('Mostrar menos');
    expect(botao.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(botao);
  });

  it('deve apontar o botão para o contêiner das listas quando há eventos ocultos', () => {
    // Arrange
    renderizar(criarVarios(12));

    // Act
    const botao: HTMLElement = screen.getByRole('button', { name: /Mostrar 2 eventos/ });

    // Assert
    const alvo: HTMLElement | null = document.getElementById(
      botao.getAttribute('aria-controls') ?? '',
    );
    expect(botao.getAttribute('aria-expanded')).toBe('false');
    expect(within(alvo as HTMLElement).getAllByRole('listitem')).toHaveLength(10);
  });

  it('deve omitir o botão de recolhimento quando há exatamente 10 eventos', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = criarVarios(10);

    // Act
    renderizar(itens);

    // Assert
    expect(screen.queryByRole('button', { name: /Mostrar/ })).toBeNull();
  });

  it('deve mostrar o conteúdo vazio quando a lista não tem eventos', () => {
    // Arrange
    const vazio = <p>Nada por aqui</p>;

    // Act
    renderizar([], vazio);

    // Assert
    expect(screen.getByText('Nada por aqui')).toBeTruthy();
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('deve limitar a coluna de leitura a 720px quando há eventos', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = [criarItem('a', emIso(0, 10))];

    // Act
    renderizar(itens);

    // Assert
    expect(screen.getByRole('region').className).toContain('max-w-[720px]');
  });

  it('deve usar transições somente sob motion-safe quando há eventos', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = [
      ...criarVarios(11),
      criarItem('l', emIso(0, 9), { destino: '/x' }),
    ];

    // Act
    const { container } = renderizar(itens);

    // Assert
    const soltas: string[] = Array.from(container.querySelectorAll('*'))
      .flatMap((e: Element) => Array.from(e.classList))
      .filter(
        (c: string) =>
          /(^|:)(transition|animate|duration)/.test(c) && !c.startsWith('motion-safe:'),
      );
    expect(soltas).toEqual([]);
  });

  it('deve garantir alvo de toque no botão e no horário quando há eventos ocultos', () => {
    // Arrange
    renderizar(criarVarios(11));

    // Act
    const botoes: HTMLElement[] = screen.getAllByRole('button');

    // Assert
    expect(botoes.length).toBeGreaterThan(1);
    for (const botao of botoes) expect(botao.className).toContain('pointer-coarse:min-h-11');
  });

  it('deve manter o contorno de foco do projeto quando os controles recebem foco', () => {
    // Arrange
    const itens: ItemDaLinhaDoTempo[] = [
      ...criarVarios(11),
      criarItem('l', emIso(0, 9), { destino: '/x' }),
    ];

    // Act
    const { container } = renderizar(itens);

    // Assert
    const proibidas: string[] = Array.from(container.querySelectorAll('*'))
      .flatMap((e: Element) => Array.from(e.classList))
      .filter((c: string) => c.includes('outline-none') || c.includes('ring-accent'));
    expect(proibidas).toEqual([]);
  });
});
