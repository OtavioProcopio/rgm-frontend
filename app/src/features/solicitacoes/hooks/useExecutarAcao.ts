import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import type { AnexarEvidenciaOptions } from '@/features/evidencias/api/evidenciasApi';
import { useAnexoComAviso } from '@/features/evidencias/hooks/useAnexoComAviso';
import { useUploadEvidencia } from '@/features/evidencias/hooks/useUploadEvidencia';

import { getSolicitacaoErrorMessage, mensagemFotoNaoEnviadaAntes } from '../lib/solicitacaoMessages';
import { solicitacoesKeys } from './solicitacoesKeys';

export type EvidenciaDaAcao = AnexarEvidenciaOptions & {
  file: File | null;
  /** Frase do aviso se a ação for feita e a foto não for enviada. */
  feito?: string;
  /**
   * Envia a foto antes da ação; se o envio falhar, a ação não é executada. Necessário
   * quando a ação encerra a solicitação, que deixa de aceitar anexo.
   */
  anexarAntes?: boolean;
};

/**
 * Fluxo comum das ações da solicitação: executa, anexa a foto que acompanha a ação e
 * avisa quem abriu o formulário. Se a ação falha, o erro fica disponível e nada é fechado.
 * Se a ação é feita e a foto falha, o aviso fica disponível até o usuário sair dele.
 * `atualizadaPorOutro` indica que a solicitação mudou por evento com o formulário aberto.
 */
export function useExecutarAcao(solicitacaoId: string, onConcluida: () => void) {
  const queryClient = useQueryClient();
  const anexoDepois = useAnexoComAviso();
  const anexoAntes = useUploadEvidencia(solicitacaoId);
  const fotoJaEnviada = useRef<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemDoAviso, setMensagemDoAviso] = useState('');

  // Marca de mudanças recebidas por evento para esta solicitação. Só avisa "outro usuário"
  // a mudança que chegou depois de o formulário abrir e fora da execução da própria ação,
  // que também gera evento.
  const chaveDaMarca = solicitacoesKeys.atualizacao(solicitacaoId);
  const { data: marca } = useQuery<number>({ queryKey: chaveDaMarca, enabled: false });
  const [marcaVista, setMarcaVista] = useState(() => queryClient.getQueryData<number>(chaveDaMarca));
  const [executando, setExecutando] = useState(false);

  function atualizarHistorico() {
    void queryClient.invalidateQueries({ queryKey: solicitacoesKeys.atividades(solicitacaoId) });
  }

  async function executar(acao: () => Promise<unknown>, evidencia?: EvidenciaDaAcao) {
    setExecutando(true);
    try {
      await executarPassos(acao, evidencia);
    } finally {
      setMarcaVista(queryClient.getQueryData<number>(chaveDaMarca));
      setExecutando(false);
    }
  }

  async function executarPassos(acao: () => Promise<unknown>, evidencia?: EvidenciaDaAcao) {
    const { file = null, feito = '', anexarAntes = false, ...opcoes }: Partial<EvidenciaDaAcao> =
      evidencia ?? {};
    setErro(null);

    if (file && anexarAntes && fotoJaEnviada.current !== file) {
      try {
        await anexoAntes.mutateAsync({ file, ...opcoes });
        fotoJaEnviada.current = file;
      } catch (err) {
        setErro(mensagemFotoNaoEnviadaAntes(err));
        return;
      }
    }

    try {
      await acao();
    } catch (err) {
      setErro(getSolicitacaoErrorMessage(err));
      return;
    }

    if (file && !anexarAntes) {
      setMensagemDoAviso(feito);
      const enviada = await anexoDepois.anexar(solicitacaoId, file, opcoes);
      if (!enviada) return;
      atualizarHistorico();
    }
    onConcluida();
  }

  async function tentarNovamente() {
    if (await anexoDepois.tentarNovamente()) atualizarHistorico();
  }

  const aviso = anexoDepois.estado
    ? {
        mensagem: mensagemDoAviso,
        estado: anexoDepois.estado,
        enviando: anexoDepois.enviando,
        onTentarNovamente: tentarNovamente,
      }
    : null;

  // A marca só cresce; a do cache pode estar um passo à frente da que o componente já recebeu.
  const atualizadaPorOutro = !executando && (marca ?? 0) > (marcaVista ?? 0);

  return { erro, aviso, atualizadaPorOutro, executar };
}
