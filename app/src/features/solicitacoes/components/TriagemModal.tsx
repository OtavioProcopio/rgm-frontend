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
  triarSolicitacaoSchema,
  type TriarSolicitacaoFormData,
} from '../schemas/solicitacaoSchema';

type UsuarioOpcao = { id: string; nome: string };

type Props = {
  isPending?: boolean;
  usuarios: UsuarioOpcao[];
  onCancel: () => void;
  onConfirm: (data: TriarSolicitacaoFormData, foto: File | null, nota: string) => void;
};

const prioridadeOptions = Object.entries(rotuloDaPrioridade).map(([value, label]) => ({
  value,
  label,
}));

export function TriagemModal({ isPending, usuarios, onCancel, onConfirm }: Props) {
  const [foto, setFoto] = useState<File | null>(null);
  const [nota, setNota] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TriarSolicitacaoFormData>({
    resolver: zodResolver(triarSolicitacaoSchema),
    defaultValues: {
      responsavelIds: [],
    },
  });

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
        <Select
          label="Prioridade"
          options={prioridadeOptions}
          placeholder="Selecione..."
          error={errors.prioridade?.message}
          {...register('prioridade')}
        />

        <div>
          <p className="mb-2 block text-sm font-medium text-fg">Responsáveis</p>
          {usuarios.length === 0 ? (
            <p className="text-sm text-fg-muted">Nenhum responsável disponível.</p>
          ) : (
            <div className="space-y-2">
              {usuarios.map((u) => (
                <label
                  key={u.id}
                  className="flex cursor-pointer items-center gap-2 pointer-coarse:min-h-11"
                >
                  <input
                    type="checkbox"
                    value={u.id}
                    className="h-4 w-4 rounded border-line-strong"
                    {...register('responsavelIds')}
                  />
                  <span className="text-sm text-fg">{u.nome}</span>
                </label>
              ))}
            </div>
          )}
          {errors.responsavelIds && (
            <p className="mt-1 text-sm text-danger-fg">{errors.responsavelIds.message}</p>
          )}
        </div>

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
