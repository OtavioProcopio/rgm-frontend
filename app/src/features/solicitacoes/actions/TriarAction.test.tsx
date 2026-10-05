/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api/apiError';
import { createQueryWrapper } from '@/test-utils/queryWrapper';
import { criarSolicitacao } from '@/test-utils/solicitacaoFixture';

import { TriarAction } from './TriarAction';

const triar = vi.fn();
const anexar = vi.fn();
const foto = new File(['x'], 'instrucao.png', { type: 'image/png' });
const dados = { prioridade: 'ALTA', responsavelIds: ['op'] };

vi.mock('../hooks/useTriarSolicitacao', () => ({
  useTriarSolicitacao: () => ({ mutateAsync: triar, isPending: false }),
}));
vi.mock('@/features/evidencias/api/evidenciasApi', () => ({
  evidenciasApi: { anexar: (...args: unknown[]) => anexar(...args) },
}));
vi.mock('@/features/admin/usuarios/hooks/useResponsaveisDisponiveis', () => ({
  useResponsaveisDisponiveis: () => ({ responsaveis: [{ id: 'op', nome: 'Olga Operadora' }], isLoading: false }),
}));
vi.mock('../components/TriagemModal', () => ({
  TriagemModal: ({
    usuarios,
    onCancel,
    onConfirm,
  }: {
    usuarios: { id: string; nome: string }[];
    onCancel: () => void;
    onConfirm: (data: unknown, foto: File | null, nota: string) => void;
  }) => (
    <form aria-label="Triagem">
      {usuarios.map((u) => (
        <span key={u.id}>{u.nome}</span>
      ))}
      <button type="button" onClick={() => onConfirm(dados, null, '')}>Confirmar</button>
      <button type="button" onClick={() => onConfirm(dados, foto, 'usar gabarito')}>Confirmar com foto</button>
      <button type="button" onClick={() => onConfirm(dados, foto, '')}>Confirmar com foto sem nota</button>
      <button type="button" onClick={onCancel}>Fechar</button>
    </form>
  ),
}));

function montar() {
  const onClose = vi.fn();
  const { QueryWrapper } = createQueryWrapper();
  render(<TriarAction solicitacao={criarSolicitacao()} onClose={onClose} />, { wrapper: QueryWrapper });
  return { onClose };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('TriarAction', () => {
  it('deve listar os responsáveis disponíveis quando o formulário abre', () => {
    // Act
    montar();

    // Assert
    expect(screen.getByText('Olga Operadora')).toBeDefined();
  });

  it('deve triar e fechar quando a triagem é confirmada', async () => {
    // Arrange
    triar.mockResolvedValue(undefined);
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    // Assert
    expect(triar).toHaveBeenCalledWith(dados);
    expect(anexar).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve anexar a foto como instrução de serviço quando a triagem tem foto e nota', async () => {
    // Arrange
    triar.mockResolvedValue(undefined);
    anexar.mockResolvedValue(undefined);
    montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar com foto' }));

    // Assert
    expect(anexar).toHaveBeenCalledWith('s1', foto, { tipo: 'INSTRUCAO_SERVICO', descricao: 'usar gabarito' });
  });

  it('deve anexar a foto sem descrição quando a nota está vazia', async () => {
    // Arrange
    triar.mockResolvedValue(undefined);
    anexar.mockResolvedValue(undefined);
    montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar com foto sem nota' }));

    // Assert
    expect(anexar).toHaveBeenCalledWith('s1', foto, { tipo: 'INSTRUCAO_SERVICO', descricao: undefined });
  });

  it('deve mostrar o erro no formulário sem fechá-lo quando a API recusa a triagem', async () => {
    // Arrange
    const recusa = new ApiError({ status: 409, message: 'Solicitação já foi triada.' });
    triar.mockRejectedValue(recusa);
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    // Assert
    expect((await screen.findByRole('alert')).textContent).toBe(recusa.message);
    expect(screen.getByRole('form', { name: 'Triagem' })).toBeDefined();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve fechar sem triar quando o formulário é cancelado', async () => {
    // Arrange
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    // Assert
    expect(triar).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve avisar que a solicitação foi triada e a foto não foi enviada, sem fechar, quando o envio da foto falha', async () => {
    // Arrange
    triar.mockResolvedValue(undefined);
    anexar.mockRejectedValue(new Error('rede'));
    const { onClose } = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar com foto' }));

    // Assert
    const alerta = await screen.findByRole('alert');
    expect(alerta.textContent).toContain('A solicitação foi triada, mas a foto não foi enviada.');
    expect(alerta.textContent).toContain('anexar a foto depois, pelo detalhe da solicitação');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeDefined();
    expect(screen.queryByRole('form', { name: 'Triagem' })).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve trocar o aviso por Foto enviada sem triar de novo quando a nova tentativa dá certo', async () => {
    // Arrange
    triar.mockResolvedValue(undefined);
    anexar.mockRejectedValueOnce(new Error('rede')).mockResolvedValueOnce(undefined);
    montar();
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar com foto' }));

    // Act
    await userEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect((await screen.findByRole('status')).textContent).toContain('Foto enviada.');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(triar).toHaveBeenCalledTimes(1);
    expect(anexar).toHaveBeenCalledTimes(2);
  });

  it('deve fechar quando o usuário sai do aviso de foto não enviada', async () => {
    // Arrange
    triar.mockResolvedValue(undefined);
    anexar.mockRejectedValue(new Error('rede'));
    const { onClose } = montar();
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar com foto' }));

    // Act
    await userEvent.click(await screen.findByRole('button', { name: 'Fechar' }));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
