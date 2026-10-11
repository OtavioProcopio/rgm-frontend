/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AcaoAvisos } from '@/features/solicitacoes/actions/AcaoAvisos';

const ERRO = 'A solicitação já foi encerrada.';

const classes = (elemento: Element) => elemento.className.split(' ');

afterEach(cleanup);

describe('AcaoAvisos', () => {
  it('deve mostrar o erro como alerta quando a ação falha', () => {
    // Act
    render(<AcaoAvisos erro={ERRO} />);

    // Assert
    expect(screen.getByRole('alert').textContent).toBe(ERRO);
  });

  it('deve avisar da mudança feita por outro usuário quando a solicitação é atualizada com o formulário aberto', () => {
    // Act
    render(<AcaoAvisos erro={null} atualizadaPorOutro />);

    // Assert
    expect(screen.getByRole('status').textContent).toBe(
      'Atualizada por outro usuário. Confira a solicitação antes de confirmar.',
    );
  });

  it('deve não mostrar nada quando não há erro nem mudança feita por outro usuário', () => {
    // Act
    const { container } = render(<AcaoAvisos erro={null} />);

    // Assert
    expect(container.textContent).toBe('');
  });
});

describe('AcaoAvisos — cores por papel', () => {
  it('deve usar o fundo e o texto de perigo quando mostra o erro', () => {
    // Act
    render(<AcaoAvisos erro={ERRO} />);

    // Assert
    expect(classes(screen.getByRole('alert'))).toEqual(
      expect.arrayContaining(['bg-danger-soft', 'text-danger-fg']),
    );
  });

  it('deve usar o fundo e o texto de alerta quando avisa da mudança feita por outro usuário', () => {
    // Act
    render(<AcaoAvisos erro={null} atualizadaPorOutro />);

    // Assert
    expect(classes(screen.getByRole('status'))).toEqual(
      expect.arrayContaining(['bg-warning-soft', 'text-warning-fg']),
    );
  });
});
