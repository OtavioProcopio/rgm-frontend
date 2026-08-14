import { useMemo } from 'react';

import { useMaquinas } from './useMaquinas';

/**
 * Opções de máquina/encaixe a partir do catálogo (GET /api/maquinas).
 * Mantém `currentValue` visível mesmo se a máquina estiver desativada ou
 * fora do catálogo, para não perder/alterar um dado já selecionado
 * (modelo em edição, ou filtro já aplicado) enquanto o catálogo carrega.
 */
export function useMaquinaOptions(currentValue?: string) {
  const { data: maquinas, isLoading } = useMaquinas();

  const options = useMemo(() => {
    const ativas = (maquinas ?? []).filter((m) => m.ativo);
    const opts = ativas.map((m) => ({ value: m.nome, label: m.nome }));

    if (currentValue && !ativas.some((m) => m.nome === currentValue)) {
      opts.push({ value: currentValue, label: `${currentValue} (fora do catálogo)` });
    }

    return opts;
  }, [maquinas, currentValue]);

  return { options, isLoading };
}
