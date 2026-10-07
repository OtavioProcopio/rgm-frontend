import { useState } from 'react';

import { useBuscaDeModelos } from '@/features/admin/modelos/hooks/useBuscaDeModelos';
import { useModelo } from '@/features/admin/modelos/hooks/useModelo';
import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';
import { Combobox, type ComboboxOption } from '@/shared/components/Combobox/Combobox';

type Props = {
  label: string;
  /** Id do modelo selecionado; vazio quando não há. */
  value: string;
  onChange: (modeloId: string) => void;
  placeholder?: string;
  error?: string;
};

function opcaoDoModelo(modelo: Pick<Modelo, 'id' | 'codigo' | 'descricao' | 'maquina'>): ComboboxOption {
  return {
    value: modelo.id,
    label: `${modelo.codigo} - ${modelo.descricao}`,
    subLabel: modelo.maquina,
  };
}

/**
 * Campo de modelo que busca na API pelo código conforme o usuário digita. O modelo já
 * selecionado continua aparecendo mesmo quando não está entre os resultados da busca.
 */
export function SeletorDeModelo({ label, value, onChange, placeholder, error }: Props) {
  const [termo, setTermo] = useState('');
  const { modelos, buscando } = useBuscaDeModelos(termo);
  const { data: selecionado } = useModelo(value || undefined);

  return (
    <Combobox
      label={label}
      placeholder={placeholder ?? 'Digite o código do modelo...'}
      options={modelos.map(opcaoDoModelo)}
      value={value}
      onChange={onChange}
      onSearchChange={setTermo}
      selectedOption={value && selecionado ? opcaoDoModelo(selecionado) : null}
      loading={buscando}
      error={error}
    />
  );
}
