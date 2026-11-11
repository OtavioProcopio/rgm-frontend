/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BotaoDeFiltro } from '@/features/modelos/components/BotaoDeFiltro';
import type { BotaoDoCatalogo } from '@/features/modelos/lib/botoesDoCatalogo';

afterEach(cleanup);

const BASE: BotaoDoCatalogo = {
  valor: 'RESINA',
  rotulo: 'Resina',
  total: 3,
  escolhido: false,
  desabilitado: false,
};

describe('BotaoDeFiltro', () => {
  it('deve chamar a escolha com o valor do botão quando é clicado', async () => {
    // Arrange
    const onEscolher = vi.fn();
    render(<BotaoDeFiltro botao={BASE} onEscolher={onEscolher} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Resina/ }));

    // Assert
    expect(onEscolher).toHaveBeenCalledExactlyOnceWith('RESINA');
  });

  it('deve anunciar o rótulo e quantos modelos traria no nome acessível', () => {
    render(<BotaoDeFiltro botao={BASE} onEscolher={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Resina (3 modelos)' })).toBeDefined();
  });

  it('deve usar o singular quando traria 1 modelo', () => {
    render(<BotaoDeFiltro botao={{ ...BASE, total: 1 }} onEscolher={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Resina (1 modelo)' })).toBeDefined();
  });

  it('não deve mostrar número quando as contagens não estão disponíveis', () => {
    render(<BotaoDeFiltro botao={{ ...BASE, total: null }} onEscolher={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Resina' })).toBeDefined();
  });

  it('deve anunciar o estado pressionado só quando está escolhido', () => {
    const { rerender } = render(<BotaoDeFiltro botao={BASE} onEscolher={vi.fn()} />);
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false');

    rerender(<BotaoDeFiltro botao={{ ...BASE, escolhido: true }} onEscolher={vi.fn()} />);

    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');
  });

  it('deve ficar desabilitado e não reagir ao clique quando não traria nenhum modelo', async () => {
    // Arrange
    const onEscolher = vi.fn();
    render(
      <BotaoDeFiltro botao={{ ...BASE, total: 0, desabilitado: true }} onEscolher={onEscolher} />,
    );

    // Act
    await userEvent.click(screen.getByRole('button'));

    // Assert
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
    expect(onEscolher).not.toHaveBeenCalled();
  });

  it('deve ter o alvo de toque mínimo de 44 px', () => {
    render(<BotaoDeFiltro botao={BASE} onEscolher={vi.fn()} />);

    expect(screen.getByRole('button').className).toContain('min-h-11');
  });
});
