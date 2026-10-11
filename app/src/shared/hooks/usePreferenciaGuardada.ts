import { useCallback, useState } from 'react';

import { gravarPreferencia, lerPreferencia } from '@/shared/lib/preferenciaDeInterface';

export function usePreferenciaGuardada(
  chave: string,
  padrao: string,
): [string, (valor: string) => void] {
  const [valor, setValor] = useState<string>(() => lerPreferencia(chave, padrao));

  const alterar = useCallback(
    (novo: string): void => {
      gravarPreferencia(chave, novo);
      setValor(novo);
    },
    [chave],
  );

  return [valor, alterar];
}
