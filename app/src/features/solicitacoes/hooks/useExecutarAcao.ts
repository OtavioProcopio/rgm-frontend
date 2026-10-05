import { useQueryClient } from '@tanstack/react-query';
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
 */
export function useExecutarAcao(solicitacaoId: string, onConcluida: () => void) {
  const queryClient = useQueryClient();
  const anexoDepois = useAnexoComAviso();
  const anexoAntes = useUploadEvidencia(solicitacaoId);
  const fotoJaEnviada = useRef<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemDoAviso, setMensagemDoAviso] = useState('');

  function atualizarHistorico() {
    void queryClient.invalidateQueries({ queryKey: solicitacoesKeys.atividades(solicitacaoId) });
  }

  async function executar(acao: () => Promise<unknown>, evidencia?: EvidenciaDaAcao) {
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

  return { erro, aviso, executar };
}
