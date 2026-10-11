import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { ControleSegmentado } from '@/shared/components/ControleSegmentado/ControleSegmentado';
import {
  SeletorMultiplo,
  type OpcaoDoSeletor,
} from '@/shared/components/SeletorMultiplo/SeletorMultiplo';
import { Textarea } from '@/shared/components/Textarea/Textarea';
import { LIMITES } from '@/shared/lib/limites';
import { EvidenciaUploader } from '@/features/evidencias/components/EvidenciaUploader';

import { useBuscaDeResponsaveis } from '../hooks/useBuscaDeResponsaveis';
import { opcoesDePrioridadeComPrazo } from '../lib/prazosDaPrioridade';
import {
  triarSolicitacaoSchema,
  type TriarSolicitacaoFormData,
} from '../schemas/solicitacaoSchema';
import type { PrioridadeSolicitacao } from '../types/solicitacaoTypes';

type Props = {
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: (data: TriarSolicitacaoFormData, foto: File | null, nota: string) => void;
};

const OPCOES_DE_PRIORIDADE = opcoesDePrioridadeComPrazo();

export function TriagemModal({ isPending, onCancel, onConfirm }: Props) {
  const [foto, setFoto] = useState<File | null>(null);
  const [nota, setNota] = useState('');
  const { buscar, candidatos, carregando, falhou } = useBuscaDeResponsaveis();
  const [escolhidos, setEscolhidos] = useState<OpcaoDoSeletor[]>([]);
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TriarSolicitacaoFormData>({
    resolver: zodResolver(triarSolicitacaoSchema),
    defaultValues: {
      responsavelIds: [],
    },
  });

  const prioridade = watch('prioridade');

  function escolherResponsaveis(novos: OpcaoDoSeletor[]) {
    setEscolhidos(novos);
    setValue(
      'responsavelIds',
      novos.map((o) => o.valor),
      { shouldValidate: true },
    );
  }

  function onSubmit(data: TriarSolicitacaoFormData) {
    onConfirm(data, foto, nota);
  }

  return (
    <div className="rounded-md border border-info bg-info-soft p-4 text-sm">
      <h3 className="font-semibold text-info-fg">Triar solicitação</h3>
      <p className="mt-1 text-info-fg">
        Defina a prioridade e os responsáveis para colocar em andamento.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div>
          <p className="mb-2 block text-sm font-medium text-fg">Prioridade</p>
          <ControleSegmentado
            rotulo="Prioridade"
            opcoes={OPCOES_DE_PRIORIDADE}
            valor={prioridade ?? ''}
            onChange={(valor) =>
              setValue('prioridade', valor as PrioridadeSolicitacao, {
                shouldValidate: true,
              })
            }
            className="flex-wrap"
          />
          {errors.prioridade ? (
            <p className="mt-1 text-sm text-danger-fg">Escolha a prioridade.</p>
          ) : null}
        </div>

        <SeletorMultiplo
          rotulo="Responsáveis"
          escolhidas={escolhidos}
          opcoes={candidatos.map((c) => ({ valor: c.id, rotulo: c.nome }))}
          onChange={escolherResponsaveis}
          onBuscar={buscar}
          carregando={carregando}
          textoSemResultado="Nenhum responsável disponível."
          erro={
            falhou
              ? 'Não foi possível buscar os responsáveis. Tente de novo.'
              : errors.responsavelIds?.message
          }
        />

        <div>
          <p className="mb-2 block text-sm font-medium text-fg">
            Foto do que precisa ser feito (opcional)
          </p>
          <EvidenciaUploader onUpload={setFoto} />
          {foto ? <p className="mt-1 text-xs text-fg-muted">Anexado: {foto.name}</p> : null}
          {foto ? (
            <div className="mt-2">
              <Textarea
                label="Observação (opcional)"
                placeholder="Detalhe o que precisa ser feito..."
                maxLength={LIMITES.textoLongo}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={isPending} onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Triando...' : 'Confirmar triagem'}
          </Button>
        </div>
      </form>
    </div>
  );
}
