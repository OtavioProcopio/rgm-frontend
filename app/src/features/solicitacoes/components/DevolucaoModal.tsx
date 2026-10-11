import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Select } from '@/shared/components/Select/Select';
import { Textarea } from '@/shared/components/Textarea/Textarea';
import { LIMITES } from '@/shared/lib/limites';
import { rotuloDaPrioridade } from '@/shared/lib/rotulos';
import { EvidenciaUploader } from '@/features/evidencias/components/EvidenciaUploader';

import {
  devolverSolicitacaoSchema,
  type DevolverSolicitacaoFormData,
} from '../schemas/solicitacaoSchema';

type Props = {
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: (data: DevolverSolicitacaoFormData, foto: File | null) => void;
};

const prioridadeOptions = Object.entries(rotuloDaPrioridade).map(([value, label]) => ({
  value,
  label,
}));

export function DevolucaoModal({ isPending, onCancel, onConfirm }: Props) {
  const [foto, setFoto] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DevolverSolicitacaoFormData>({
    resolver: zodResolver(devolverSolicitacaoSchema),
  });

  function onSubmit(data: DevolverSolicitacaoFormData) {
    onConfirm(data, foto);
  }

  return (
    <div className="rounded-md border border-warning bg-warning-soft p-4 text-sm">
      <h3 className="font-semibold text-warning-fg">Devolver solicitação</h3>
      <p className="mt-1 text-warning-fg">A solicitação voltará para EM ANDAMENTO.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <Textarea
          label="Motivo da devolução *"
          placeholder="Descreva o motivo da devolução..."
          error={errors.motivo?.message}
          maxLength={LIMITES.textoLongo}
          {...register('motivo')}
        />
        <Select
          label="Nova prioridade (opcional)"
          options={prioridadeOptions}
          placeholder="Manter atual"
          {...register('prioridade')}
        />
        <div>
          <p className="mb-2 block text-sm font-medium text-fg">
            Foto do que ainda precisa ser corrigido (opcional)
          </p>
          <EvidenciaUploader onUpload={setFoto} />
          {foto ? <p className="mt-1 text-xs text-fg-muted">Anexado: {foto.name}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={isPending} onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Devolvendo...' : 'Confirmar devolução'}
          </Button>
        </div>
      </form>
    </div>
  );
}
