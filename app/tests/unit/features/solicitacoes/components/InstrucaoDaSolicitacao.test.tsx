/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InstrucaoDaSolicitacao } from '@/features/solicitacoes/components/InstrucaoDaSolicitacao';
import type { StatusSolicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';

afterEach(cleanup);

function montar(status: StatusSolicitacao, instrucao: string | null, aoEditar?: () => void) {
  return render(<InstrucaoDaSolicitacao solicitacao={{ status, instrucao }} aoEditar={aoEditar} />);
}

describe('InstrucaoDaSolicitacao — com instrução', () => {
  it('deve mostrar a instrução numa região nomeada pelo título quando a solicitação tem uma', () => {
    // Act
    montar('EM_ANDAMENTO', 'Trocar o gabarito');

    // Assert
    const regiao = screen.getByRole('region', { name: 'O que precisa ser feito' });
    expect(regiao.textContent).toContain('Trocar o gabarito');
  });

  it('deve preservar as quebras de linha e quebrar palavra longa quando a instrução tem várias linhas', () => {
    // Act
    montar('EM_ANDAMENTO', 'Trocar o gabarito\nConferir o furo 3');

    // Assert
    const texto = screen.getByText(/Trocar o gabarito/);
    expect(texto.textContent).toBe('Trocar o gabarito\nConferir o furo 3');
    expect(texto.className).toContain('whitespace-pre-line');
    expect(texto.className).toContain('break-words');
  });

  it('deve mostrar inteira a instrução de 2000 caracteres com uma palavra de 200 sem espaço', () => {
    // Arrange
    const palavra = 'x'.repeat(200);
    const instrucao = `${palavra} ${'a '.repeat(899)}`.trim().padEnd(2000, 'b');

    // Act
    montar('EM_VALIDACAO', instrucao);

    // Assert
    const regiao = screen.getByRole('region', { name: 'O que precisa ser feito' });
    expect(regiao.textContent).toContain(palavra);
    expect(regiao.textContent).toContain(instrucao);
    expect(regiao.querySelector('button')).toBeNull();
  });

  it('deve mostrar a instrução também numa solicitação concluída ou cancelada que a tem', () => {
    montar('CONCLUIDA', 'Já feito');
    montar('CANCELADA', 'Não será feito');

    expect(screen.getAllByRole('region', { name: 'O que precisa ser feito' })).toHaveLength(2);
  });
});

describe('InstrucaoDaSolicitacao — botão de correção', () => {
  it('deve oferecer "Editar" com nome acessível e chamar a correção quando a API permite', async () => {
    // Arrange
    const aoEditar = vi.fn();
    montar('EM_ANDAMENTO', 'Trocar o gabarito', aoEditar);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Editar o que precisa ser feito' }));

    // Assert
    expect(aoEditar).toHaveBeenCalledTimes(1);
  });

  it('não deve oferecer "Editar" quando a API não permite', () => {
    // Act
    montar('EM_ANDAMENTO', 'Trocar o gabarito', undefined);

    // Assert
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('InstrucaoDaSolicitacao — sem instrução', () => {
  it.each<StatusSolicitacao>(['EM_ANDAMENTO', 'EM_VALIDACAO', 'CONCLUIDA'])(
    'deve avisar que não há instrução registrada, com texto e sem região, quando %s a perdeu',
    (status) => {
      // Act
      montar(status, null);

      // Assert
      expect(
        screen.getByText(
          'Sem instrução registrada. Esta solicitação foi triada antes deste campo existir.',
        ),
      ).toBeDefined();
      expect(screen.queryByRole('region')).toBeNull();
    },
  );

  it('deve oferecer "Adicionar instrução" ao lado do aviso quando a API permite', async () => {
    // Arrange
    const aoEditar = vi.fn();
    montar('EM_ANDAMENTO', null, aoEditar);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar instrução' }));

    // Assert
    expect(aoEditar).toHaveBeenCalledTimes(1);
  });

  it('não deve oferecer "Adicionar instrução" quando a API não permite', () => {
    // Act
    montar('CONCLUIDA', null);

    // Assert
    expect(screen.queryByRole('button')).toBeNull();
  });

  it.each<StatusSolicitacao>(['A_FAZER', 'CANCELADA'])(
    'não deve mostrar nada quando %s não tem instrução',
    (status) => {
      // Act
      const { container } = montar(status, null);

      // Assert
      expect(container.innerHTML).toBe('');
    },
  );
});
