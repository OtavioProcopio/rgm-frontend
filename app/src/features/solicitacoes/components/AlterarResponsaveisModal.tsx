import { useState } from 'react';

import { Button } from '@/shared/components/Button/Button';
import {
  SeletorMultiplo,
  type OpcaoDoSeletor,
} from '@/shared/components/SeletorMultiplo/SeletorMultiplo';

import { useBuscaDeResponsaveis } from '../hooks/useBuscaDeResponsaveis';

type Props = {
  /** Responsáveis de hoje, com o nome para a etiqueta. */
  responsaveisAtuais: { id: string; nome: string }[];
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: (responsavelIds: string[]) => void;
};

export function AlterarResponsaveisModal({
  responsaveisAtuais,
  isPending,
  onCancel,
  onConfirm,
}: Props) {
  const { buscar, candidatos, carregando, falhou } = useBuscaDeResponsaveis();
  const [escolhidos, setEscolhidos] = useState<OpcaoDoSeletor[]>(
    responsaveisAtuais.map((r) => ({ valor: r.id, rotulo: r.nome })),
  );

  return (
    <div className="rounded-md border border-info bg-info-soft p-4 text-sm">
      <h3 className="font-semibold text-info-fg">Alterar responsáveis</h3>
      <p className="mt-1 text-info-fg">
        Busque pelo nome e escolha os responsáveis pela execução desta solicitação.
      </p>
      <div className="mt-4">
        <SeletorMultiplo
          rotulo="Responsáveis"
          escolhidas={escolhidos}
          opcoes={candidatos.map((c) => ({ valor: c.id, rotulo: c.nome }))}
          onChange={setEscolhidos}
          onBuscar={buscar}
          carregando={carregando}
          textoSemResultado="Nenhum responsável disponível."
          erro={falhou ? 'Não foi possível buscar os responsáveis. Tente de novo.' : undefined}
        />
      </div>
      {escolhidos.length === 0 && (
        <p className="mt-2 text-xs text-danger-fg">Selecione pelo menos 1 responsável.</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={isPending || escolhidos.length === 0}
          onClick={() => onConfirm(escolhidos.map((e) => e.valor))}
        >
          {isPending ? 'Salvando...' : 'Confirmar'}
        </Button>
      </div>
    </div>
  );
}
