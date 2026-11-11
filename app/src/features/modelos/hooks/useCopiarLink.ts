import { useCallback, useState } from 'react';

export type EstadoDaCopia = 'parado' | 'copiado' | 'bloqueado';

/**
 * Copia o endereço atual para a área de transferência. Em contexto sem esse recurso (página fora de
 * HTTPS) ou se o navegador recusar, o estado vira `bloqueado` e a tela mostra o endereço para a
 * pessoa copiar à mão.
 */
export function useCopiarLink() {
  const [estado, setEstado] = useState<EstadoDaCopia>('parado');

  const copiar = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setEstado('copiado');
    } catch {
      setEstado('bloqueado');
    }
  }, []);

  const reiniciar = useCallback(() => setEstado('parado'), []);

  return { estado, copiar, reiniciar };
}
