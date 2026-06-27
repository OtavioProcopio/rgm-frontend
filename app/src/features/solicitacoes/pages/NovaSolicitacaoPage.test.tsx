/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';
import { evidenciasApi } from '@/features/evidencias/api/evidenciasApi';
import { useAbrirSolicitacao } from '../hooks/useAbrirSolicitacao';

import { NovaSolicitacaoPage } from './NovaSolicitacaoPage';

vi.mock('../hooks/useAbrirSolicitacao', () => ({
  useAbrirSolicitacao: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/features/admin/modelos/hooks/useModelos', () => ({
  useModelos: vi.fn().mockReturnValue({
    data: { content: [{ id: '1', codigo: 'MD-1', descricao: 'Modelo 1', maquina: 'M-1' }], totalElements: 1 },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/features/evidencias/api/evidenciasApi', () => ({
  evidenciasApi: {
    anexar: vi.fn().mockResolvedValue({}),
  },
}));

afterEach(cleanup);

describe('NovaSolicitacaoPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/nova solicitação/i)).toBeDefined();
  });

  it('renders form fields', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });
    expect(within(container).getByLabelText(/título/i)).toBeDefined();
    expect(within(container).getByLabelText(/descrição/i)).toBeDefined();
    expect(within(container).getByLabelText(/tipo/i)).toBeDefined();
    expect(within(container).getByLabelText(/modelo/i)).toBeDefined();
    expect(within(container).getByText(/clique para selecionar uma foto/i)).toBeDefined();
  });

  it('renders submit button', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('button', { name: /abrir solicitação/i })).toBeDefined();
  });

  it('submits form and calls abrir and annexes photo if selected', async () => {
    const mockMutate = vi.fn().mockResolvedValue({ id: 'sol-123' });
    const useAbrirSolicitacaoMock = vi.mocked(useAbrirSolicitacao);
    useAbrirSolicitacaoMock.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useAbrirSolicitacao>);

    const { AppWrapper } = createAppWrapper();
    render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });

    await userEvent.type(screen.getByLabelText(/título/i), 'Título de teste');
    await userEvent.type(screen.getByLabelText(/descrição/i), 'Descrição de teste');
    
    // Simula a seleção de modelo no Combobox
    const comboboxInput = screen.getByLabelText(/modelo/i);
    fireEvent.focus(comboboxInput);
    
    // Clica na opção
    const option = screen.getByText('MD-1 - Modelo 1');
    fireEvent.click(option);

    // Simula o upload de arquivo
    const file = new File(['hello'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/modelo/i).closest('form')?.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Adiciona o arquivo no input
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Espera o preview carregar
    expect(await screen.findByText('test.png')).toBeDefined();

    // Remove a foto para testar remoção
    const removeBtn = screen.getByTitle('Remover foto');
    fireEvent.click(removeBtn);
    expect(screen.queryByText('test.png')).toBeNull();

    // Seleciona novamente
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(await screen.findByText('test.png')).toBeDefined();

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /abrir solicitação/i }));

    // Verifica que abrir e anexar foram chamados
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        titulo: 'Título de teste',
        descricao: 'Descrição de teste',
        tipo: 'REPARO',
        modeloId: '1',
      });
      expect(evidenciasApi.anexar).toHaveBeenCalledWith('sol-123', file);
    });
  });
});
