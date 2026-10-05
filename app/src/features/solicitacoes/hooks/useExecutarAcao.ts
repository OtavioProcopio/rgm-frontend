import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type { AnexarEvidenciaOptions } from '@/features/evidencias/api/evidenciasApi';
import { useUploadEvidencia } from '@/features/evidencias/hooks/useUploadEvidencia';

import { getSolicitacaoErrorMessage } from '../lib/solicitacaoMessages';
import { solicitacoesKeys } from './solicitacoesKeys';

export type EvidenciaDaAcao = { file: File | null } & AnexarEvidenciaOptions;

/**
 * Fluxo comum das ações da solicitação: executa, anexa a foto que acompanha a ação e
 * avisa quem abriu o formulário. Se a ação falha, o erro fica disponível e nada é fechado.
 */
export function useExecutarAcao(solicitacaoId: string, onConcluida: () => void) {
  const queryClient = useQueryClient();
  const anexar = useUploadEvidencia(solicitacaoId);
  const [erro, setErro] = useState<string | null>(null);

  async function executar(acao: () => Promise<unknown>, evidencia?: EvidenciaDaAcao) {
    setErro(null);
    try {
      await acao();
    } catch (err) {
      setErro(getSolicitacaoErrorMessage(err));
      return;
    }
    if (evidencia?.file) {
      const { file, ...opcoes } = evidencia;
      try {
        await anexar.mutateAsync({ file, ...opcoes });
        void queryClient.invalidateQueries({ queryKey: solicitacoesKeys.atividades(solicitacaoId) });
      } catch (uploadErr) {
        // A ação já foi concluída; a falha do anexo não a desfaz.
        console.error('Erro ao anexar evidência da ação:', uploadErr);
      }
    }
    onConcluida();
  }

  return { erro, executar };
}
