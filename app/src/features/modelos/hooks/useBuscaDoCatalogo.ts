import { useEffect, useRef, useState } from 'react';

import { useDebounce } from '@/shared/hooks/useDebounce';

const ESPERA_DA_BUSCA_MS = 300;

/**
 * O texto do campo de busca, que responde na hora, e o envio dele para o endereço depois de 300 ms
 * sem digitar. Mudança vinda de fora (limpar os filtros, link) volta para o campo, mas o eco do
 * que o próprio campo acabou de enviar não apaga o que a pessoa já digitou depois.
 */
export function useBuscaDoCatalogo(qDoEndereco: string, enviar: (q: string) => void) {
  const [digitado, setDigitado] = useState(qDoEndereco);
  const atrasado = useDebounce(digitado, ESPERA_DA_BUSCA_MS);
  const ultimoSincronizado = useRef(qDoEndereco);

  useEffect(() => {
    if (atrasado !== ultimoSincronizado.current) {
      ultimoSincronizado.current = atrasado;
      enviar(atrasado);
    }
  }, [atrasado, enviar]);

  useEffect(() => {
    if (qDoEndereco !== ultimoSincronizado.current) {
      ultimoSincronizado.current = qDoEndereco;
      setDigitado(qDoEndereco);
    }
  }, [qDoEndereco]);

  return { digitado, setDigitado };
}
