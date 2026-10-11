import { useMemo } from 'react';

import { nomeDoTipoDeModelo } from '@/shared/lib/rotulos';

import { useTiposModelo } from './useTiposModelo';

/**
 * Opções de tipo a partir do catálogo (GET /api/tipos-modelo): só os ativos, mais o tipo que o
 * modelo já tem mesmo desativado, para não perder o dado em edição. Começa com "Não definido".
 */
export function useTipoModeloOptions(currentValue?: string | null) {
  const { data: tipos, isLoading } = useTiposModelo();

  const options = useMemo(() => {
    const ativos = (tipos ?? []).filter((t) => t.ativo);
    const opts = [
      { value: '', label: 'Não definido' },
      ...ativos.map((t) => ({ value: t.nome, label: nomeDoTipoDeModelo(t.nome) })),
    ];

    if (currentValue && !ativos.some((t) => t.nome === currentValue)) {
      opts.push({ value: currentValue, label: `${nomeDoTipoDeModelo(currentValue)} (inativo)` });
    }

    return opts;
  }, [tipos, currentValue]);

  return { options, isLoading };
}
