/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AlterarResponsaveisModal } from '@/features/solicitacoes/components/AlterarResponsaveisModal';

const candidatos = [
  { id: 'u1', nome: 'João', perfil: 'OPERADOR' },
  { id: 'u2', nome: 'Maria', perfil: 'OPERADOR' },
];
let falhou = false;

vi.mock('@/features/solicitacoes/hooks/useBuscaDeResponsaveis', () => ({
  useBuscaDeResponsaveis: () => ({
    buscar: vi.fn(),
    candidatos,
    carregando: false,
    falhou,
  }),
}));

const classes = (elemento: Element) => elemento.className.split(' ');

function montar(atuais: { id: string; nome: string }[] = [], isPending = false) {
  const onConfirm = vi.fn<(responsavelIds: string[]) => void>();
  const onCancel = vi.fn<() => void>();
  const { container } = render(
    <AlterarResponsaveisModal
      responsaveisAtuais={atuais}
      isPending={isPending}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />,
  );
  return { container, onConfirm, onCancel };
}

afterEach(() => {
  cleanup();
  falhou = false;
});

describe('AlterarResponsaveisModal', () => {
  it('deve mostrar os responsáveis atuais como etiquetas quando abre', () => {
    // Act
    montar([{ id: 'u1', nome: 'João' }]);

    // Assert
    expect(screen.getByRole('button', { name: 'Remover João' })).toBeDefined();
  });

  it('deve confirmar com os responsáveis escolhidos quando um responsável é acrescentado', async () => {
    // Arrange
    const { onConfirm } = montar([{ id: 'u1', nome: 'João' }]);
    await userEvent.click(screen.getByRole('button', { name: 'Maria' }));

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    // Assert
    expect(onConfirm.mock.calls).toEqual([[['u1', 'u2']]]);
  });

  it('deve impedir a confirmação quando nenhum responsável está escolhido', () => {
    // Act
    montar([]);
    const confirmar = screen.getByRole('button', { name: 'Confirmar' }) as HTMLButtonElement;

    // Assert
    expect(confirmar.disabled).toBe(true);
    expect(screen.getByText('Selecione pelo menos 1 responsável.')).toBeDefined();
  });

  it('deve impedir a confirmação quando o último responsável é removido', async () => {
    // Arrange
    montar([{ id: 'u1', nome: 'João' }]);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Remover João' }));

    // Assert
    expect((screen.getByRole('button', { name: 'Confirmar' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('deve chamar onCancel uma vez quando Cancelar é acionado', async () => {
    // Arrange
    const { onCancel } = montar([{ id: 'u1', nome: 'João' }]);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('deve usar o fundo e a borda de informação quando o formulário é mostrado', () => {
    // Act
    const { container } = montar();

    // Assert
    expect(classes(container.firstElementChild!)).toEqual(
      expect.arrayContaining(['bg-info-soft', 'border-info']),
    );
  });

  it('deve mostrar o estado de envio e bloquear a confirmação quando a alteração está pendente', () => {
    // Act
    montar([{ id: 'u1', nome: 'João' }], true);
    const salvando = screen.getByRole('button', { name: 'Salvando...' }) as HTMLButtonElement;

    // Assert
    expect(salvando.disabled).toBe(true);
  });

  it('deve avisar quando a busca de responsáveis falha', () => {
    // Arrange
    falhou = true;

    // Act
    montar([{ id: 'u1', nome: 'João' }]);

    // Assert
    expect(screen.getByText(/Não foi possível buscar os responsáveis/)).toBeDefined();
  });
});
