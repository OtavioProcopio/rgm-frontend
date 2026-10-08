/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Route, Routes } from 'react-router';

import { createAppWrapper } from '@tests/support/appWrapper';
import { evidenciasApi } from '@/features/evidencias/api/evidenciasApi';
import { useAbrirSolicitacao } from '@/features/solicitacoes/hooks/useAbrirSolicitacao';

import { NovaSolicitacaoPage } from '@/features/solicitacoes/pages/NovaSolicitacaoPage';
import { LIMITES } from '@/shared/lib/limites';
import { rotuloDoTipoDeSolicitacao } from '@/shared/lib/rotulos';
import { ancestralComum } from '@tests/support/ancestralComum';

vi.mock('@/shared/lib/rotulos', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/shared/lib/rotulos')>();
  const daFonte = Object.fromEntries(
    Object.keys(original.rotuloDoTipoDeSolicitacao).map((tipo) => [tipo, `Rótulo de ${tipo}`]),
  );
  return { ...original, rotuloDoTipoDeSolicitacao: daFonte };
});

vi.mock('@/features/solicitacoes/hooks/useAbrirSolicitacao', () => ({
  useAbrirSolicitacao: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/features/admin/modelos/hooks/useModelos', () => ({
  useModelos: vi.fn().mockReturnValue({
    data: {
      content: [{ id: '1', codigo: 'MD-1', descricao: 'Modelo 1', maquina: 'M-1' }],
      totalElements: 1,
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/features/admin/modelos/hooks/useModelo', () => ({
  useModelo: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('@/features/evidencias/api/evidenciasApi', () => ({
  evidenciasApi: {
    anexar: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/features/admin/modelos/hooks/useMaquinaOptions', () => ({
  useMaquinaOptions: vi.fn().mockReturnValue({
    options: [{ value: 'FBOX', label: 'FBOX' }],
    isLoading: false,
  }),
}));

afterEach(() => {
  cleanup();
  vi.mocked(evidenciasApi.anexar).mockReset();
  vi.mocked(evidenciasApi.anexar).mockResolvedValue(
    {} as Awaited<ReturnType<typeof evidenciasApi.anexar>>,
  );
});

const foto = new File(['hello'], 'problema.png', { type: 'image/png' });

/** Preenche o formulário com foto e envia; a abertura é aceita com o id `sol-123`. */
async function abrirComFoto() {
  vi.mocked(useAbrirSolicitacao).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'sol-123' }),
    isPending: false,
  } as unknown as ReturnType<typeof useAbrirSolicitacao>);
  const { AppWrapper } = createAppWrapper({ initialEntries: ['/app/solicitacoes/nova'] });
  render(
    <Routes>
      <Route path="/app/solicitacoes/nova" element={<NovaSolicitacaoPage />} />
      <Route path="/app/solicitacoes/:id" element={<p>Detalhe da solicitação</p>} />
    </Routes>,
    { wrapper: AppWrapper },
  );
  await userEvent.type(screen.getByLabelText(/título/i), 'Correia gasta');
  await userEvent.type(screen.getByLabelText(/descrição/i), 'Correia da esteira desfiando');
  await userEvent.click(screen.getByLabelText(/modelo/i));
  await userEvent.click(screen.getByText('MD-1 - Modelo 1'));
  await userEvent.upload(screen.getByLabelText('Foto do problema'), foto);
  await screen.findByText('problema.png');
  await userEvent.click(screen.getByRole('button', { name: 'Abrir solicitação' }));
}

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
    const fileInput = screen
      .getByLabelText(/modelo/i)
      .closest('form')
      ?.querySelector('input[type="file"]') as HTMLInputElement;

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
      expect(evidenciasApi.anexar).toHaveBeenCalledWith('sol-123', file, { tipo: 'ABERTURA' });
    });
  });

  it('offers CRIACAO as a tipo option for GESTOR/ADMINISTRADOR', () => {
    const { AppWrapper } = createAppWrapper();
    render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });

    const select = screen.getByLabelText(/tipo/i) as HTMLSelectElement;
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).toContain('CRIACAO');
  });

  it('hides CRIACAO for OPERADOR', () => {
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });

    const select = screen.getByLabelText(/tipo/i) as HTMLSelectElement;
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).not.toContain('CRIACAO');
  });

  it('submits CRIACAO with modelo fields instead of modeloId', async () => {
    const mockMutate = vi.fn().mockResolvedValue({ id: 'sol-456' });
    const useAbrirSolicitacaoMock = vi.mocked(useAbrirSolicitacao);
    useAbrirSolicitacaoMock.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useAbrirSolicitacao>);

    const { AppWrapper } = createAppWrapper();
    render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });

    await userEvent.type(screen.getByLabelText(/título/i), 'Novo modelo XYZ');
    await userEvent.type(screen.getByLabelText(/descrição/i), 'Descrição pretendida');
    await userEvent.selectOptions(screen.getByLabelText(/tipo/i), 'CRIACAO');

    expect(screen.getByLabelText(/código do modelo/i)).toBeDefined();

    await userEvent.type(screen.getByLabelText(/código do modelo/i), 'COD-XYZ');
    await userEvent.selectOptions(screen.getByLabelText(/máquina/i), 'FBOX');

    fireEvent.click(screen.getByRole('button', { name: /abrir solicitação/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        titulo: 'Novo modelo XYZ',
        descricao: 'Descrição pretendida',
        tipo: 'CRIACAO',
        modeloCodigo: 'COD-XYZ',
        modeloMaquina: 'FBOX',
        modeloObservacoes: undefined,
      });
    });
  });

  it('deve ir para o detalhe quando a solicitação é aberta e a foto é enviada', async () => {
    // Act
    await abrirComFoto();

    // Assert
    expect(await screen.findByText('Detalhe da solicitação')).toBeDefined();
    expect(evidenciasApi.anexar).toHaveBeenCalledWith('sol-123', foto, { tipo: 'ABERTURA' });
  });

  it('deve continuar na tela com o aviso e um botão para o detalhe quando a solicitação é aberta e a foto falha', async () => {
    // Arrange
    vi.mocked(evidenciasApi.anexar).mockRejectedValue(new Error('rede'));

    // Act
    await abrirComFoto();

    // Assert
    const alerta = await screen.findByRole('alert');
    expect(alerta.textContent).toContain('A solicitação foi aberta, mas a foto não foi enviada.');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Ir para a solicitação' })).toBeDefined();
    expect(screen.queryByText('Detalhe da solicitação')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Abrir solicitação' })).toBeNull();
  });

  it('deve trocar o aviso por Foto enviada quando a nova tentativa da foto de abertura dá certo', async () => {
    // Arrange
    vi.mocked(evidenciasApi.anexar)
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValueOnce({} as Awaited<ReturnType<typeof evidenciasApi.anexar>>);
    await abrirComFoto();

    // Act
    await userEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect((await screen.findByRole('status')).textContent).toContain('Foto enviada.');
    expect(evidenciasApi.anexar).toHaveBeenLastCalledWith('sol-123', foto, { tipo: 'ABERTURA' });
    expect(screen.queryByText('Detalhe da solicitação')).toBeNull();
  });

  it('deve ir para o detalhe quando o usuário sai do aviso pelo botão', async () => {
    // Arrange
    vi.mocked(evidenciasApi.anexar).mockRejectedValue(new Error('rede'));
    await abrirComFoto();

    // Act
    await userEvent.click(await screen.findByRole('button', { name: 'Ir para a solicitação' }));

    // Assert
    expect(await screen.findByText('Detalhe da solicitação')).toBeDefined();
  });

  it('deve recusar a foto listando só imagens quando o arquivo é um PDF', async () => {
    // Arrange
    const { AppWrapper } = createAppWrapper();
    render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });
    const pdf = new File(['%PDF'], 'laudo.pdf', { type: 'application/pdf' });

    // Act
    await userEvent.upload(screen.getByLabelText('Foto do problema'), pdf, { applyAccept: false });

    // Assert
    expect(
      screen.getByText('Tipo de arquivo não permitido. Os tipos aceitos são JPEG, PNG e WebP.'),
    ).toBeDefined();
    expect(screen.queryByText('laudo.pdf')).toBeNull();
  });
});

describe('NovaSolicitacaoPage — rótulo do tipo e cores por papel', () => {
  it.each(Object.entries(rotuloDoTipoDeSolicitacao))(
    'deve mostrar na opção %s o rótulo da fonte única quando o formulário abre para o administrador',
    (tipo, rotulo) => {
      // Arrange
      const { AppWrapper } = createAppWrapper();

      // Act
      render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });
      const campo = screen.getByLabelText('Tipo') as HTMLSelectElement;
      const opcao = Array.from(campo.options).find((o) => o.value === tipo);

      // Assert
      expect(opcao?.textContent).toBe(rotulo);
    },
  );

  it('deve pôr os dados do modelo pretendido sobre a superfície suave com a borda do tema quando o tipo é criação', async () => {
    // Arrange
    const esperado = ['border-line', 'bg-surface-muted'];
    const { AppWrapper } = createAppWrapper();
    render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });

    // Act
    await userEvent.selectOptions(screen.getByLabelText('Tipo'), 'CRIACAO');
    const moldura = ancestralComum(
      screen.getByLabelText('Código do modelo'),
      screen.getByLabelText('Observações (opcional)'),
    );

    // Assert
    expect(moldura.className.split(' ')).toEqual(expect.arrayContaining(esperado));
  });

  it('deve mostrar a recusa da foto no papel de perigo quando o arquivo é um PDF', async () => {
    // Arrange
    const { AppWrapper } = createAppWrapper();
    render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });
    const pdf = new File(['%PDF'], 'laudo.pdf', { type: 'application/pdf' });

    // Act
    await userEvent.upload(screen.getByLabelText('Foto do problema'), pdf, { applyAccept: false });
    const recusa = screen.getByText(/Tipo de arquivo não permitido/);

    // Assert
    expect(recusa.className.split(' ')).toContain('text-danger-fg');
  });
});

describe('NovaSolicitacaoPage — limite de texto', () => {
  it.each([
    [/título/i, 'solicitacaoTitulo'],
    [/descrição/i, 'textoLongo'],
  ] as const)('deve limitar o campo quando o rótulo é %s', (rotulo, limite) => {
    // Arrange
    const esperado = LIMITES[limite];
    const { AppWrapper } = createAppWrapper();

    // Act
    render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });
    const campo = screen.getByLabelText(rotulo) as HTMLInputElement;

    // Assert
    expect(campo.maxLength).toBe(esperado);
  });

  it.each([
    [/código do modelo/i, 'modeloPretendidoCodigo'],
    [/observações/i, 'textoLongo'],
  ] as const)(
    'deve limitar o campo do modelo pretendido quando o rótulo é %s',
    async (rotulo, limite) => {
      // Arrange
      const esperado = LIMITES[limite];
      const { AppWrapper } = createAppWrapper();
      render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });

      // Act
      await userEvent.selectOptions(screen.getByLabelText(/tipo/i), 'CRIACAO');
      const campo = screen.getByLabelText(rotulo) as HTMLInputElement;

      // Assert
      expect(campo.maxLength).toBe(esperado);
    },
  );
});

describe('NovaSolicitacaoPage — seletor de modelo com busca', () => {
  it('deve pedir à API no máximo 20 modelos, e só ativos, para o seletor', async () => {
    // Arrange
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockClear();
    const { AppWrapper } = createAppWrapper();

    // Act
    render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });

    // Assert
    expect(vi.mocked(useModelos).mock.calls.map(([filtros]) => filtros)).toEqual(
      expect.arrayContaining([{ page: 0, size: 20, ativo: true }]),
    );
  });

  it('deve nunca pedir mais de 20 modelos de uma vez', async () => {
    // Arrange
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockClear();
    const { AppWrapper } = createAppWrapper();

    // Act
    render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });

    // Assert
    const tamanhos = vi.mocked(useModelos).mock.calls.map(([filtros]) => filtros.size);
    expect(Math.max(...tamanhos)).toBe(20);
  });

  it('deve abrir com o modelo do endereço selecionado, mesmo fora das opções da busca', async () => {
    // Arrange
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: { id: 'm-999', codigo: 'MD-999', descricao: 'Caixa', maquina: 'DISA' },
    } as unknown as ReturnType<typeof useModelo>);
    const { AppWrapper } = createAppWrapper({
      initialEntries: ['/app/solicitacoes/nova?modeloId=m-999'],
    });

    // Act
    render(<NovaSolicitacaoPage />, { wrapper: AppWrapper });

    // Assert
    expect((screen.getByLabelText('Modelo') as HTMLInputElement).value).toBe('MD-999 - Caixa');
  });
});
