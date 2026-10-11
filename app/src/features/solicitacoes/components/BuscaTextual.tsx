import { useEffect, useRef, useState } from 'react';

import { Input } from '@/shared/components/Input/Input';
import { useDebounce } from '@/shared/hooks/useDebounce';

import { BUSCA_MAXIMA, BUSCA_MINIMA, buscaCurtaDemais, termoDeBusca } from '../lib/buscaTextual';

const ATRASO_DA_BUSCA_MS = 400;

type Props = {
  /** Termo aplicado hoje (da URL ou do filtro). */
  valor?: string;
  onChange: (termo: string | undefined) => void;
};

/** Busca por título, descrição e código do modelo; só consulta com 2 ou mais caracteres. */
export function BuscaTextual({ valor, onChange }: Props) {
  const [texto, setTexto] = useState(valor ?? '');
  const atrasado = useDebounce(texto, ATRASO_DA_BUSCA_MS);
  const aplicado = useRef(valor);

  useEffect(() => {
    const termo = termoDeBusca(atrasado);
    if (termo !== aplicado.current) {
      aplicado.current = termo;
      onChange(termo);
    }
  }, [atrasado, onChange]);

  return (
    <div>
      <Input
        type="search"
        label="Buscar"
        placeholder="Título, descrição ou código do modelo"
        value={texto}
        maxLength={BUSCA_MAXIMA}
        onChange={(e) => setTexto(e.target.value)}
      />
      {buscaCurtaDemais(texto) ? (
        <p className="mt-1 text-xs text-fg-muted">
          Digite ao menos {BUSCA_MINIMA} caracteres para buscar.
        </p>
      ) : null}
    </div>
  );
}
