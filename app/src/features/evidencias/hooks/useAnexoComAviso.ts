import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { evidenciasApi, type AnexarEvidenciaOptions } from '../api/evidenciasApi';
import { evidenciasKeys } from './evidenciasKeys';

export type EstadoDoAnexo = 'falhou' | 'enviado' | null;

type Envio = { solicitacaoId: string; file: File; opcoes?: AnexarEvidenciaOptions };

/**
 * Envia a foto que acompanha uma ação e guarda o resultado para a tela avisar o usuário.
 * Quando o envio falha, o arquivo fica guardado para uma nova tentativa.
 */
export function useAnexoComAviso() {
  const queryClient = useQueryClient();
  const ultimoEnvio = useRef<Envio | null>(null);
  const [estado, setEstado] = useState<EstadoDoAnexo>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(envio: Envio, aoDarCerto: EstadoDoAnexo): Promise<boolean> {
    ultimoEnvio.current = envio;
    setEnviando(true);
    try {
      await evidenciasApi.anexar(envio.solicitacaoId, envio.file, envio.opcoes);
      void queryClient.invalidateQueries({
        queryKey: evidenciasKeys.bySolicitacao(envio.solicitacaoId),
      });
      setEstado(aoDarCerto);
      return true;
    } catch {
      setEstado('falhou');
      return false;
    } finally {
      setEnviando(false);
    }
  }

  /** Primeiro envio: se der certo, não há o que avisar. */
  function anexar(solicitacaoId: string, file: File, opcoes?: AnexarEvidenciaOptions) {
    return enviar({ solicitacaoId, file, opcoes }, null);
  }

  /** Reenvia o arquivo que falhou; se der certo, o estado passa a `enviado`. */
  async function tentarNovamente(): Promise<boolean> {
    if (!ultimoEnvio.current) return false;
    return enviar(ultimoEnvio.current, 'enviado');
  }

  return { estado, enviando, anexar, tentarNovamente };
}
