import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Textarea } from '@/shared/components/Textarea/Textarea';
import { LIMITES } from '@/shared/lib/limites';

import { instrucaoMudou } from '../lib/instrucaoMudou';
import { editarInstrucaoSchema, type EditarInstrucaoFormData } from '../schemas/solicitacaoSchema';

type Props = {
  /** A instrução que a solicitação tem agora; nula quando foi triada antes do campo existir. */
  instrucaoAtual: string | null;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: (data: EditarInstrucaoFormData) => void;
};

/** Formulário de correção da instrução: um campo, preenchido com o texto atual. */
export function EdicaoDaInstrucaoForm({ instrucaoAtual, isPending, onCancel, onConfirm }: Props) {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<EditarInstrucaoFormData>({
    resolver: zodResolver(editarInstrucaoSchema),
    defaultValues: { instrucao: instrucaoAtual ?? '' },
  });
  const digitada = useWatch({ control, name: 'instrucao' });
  const mudou = instrucaoMudou(instrucaoAtual, digitada ?? '');

  return (
    <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
      <Textarea
        label="O que precisa ser feito"
        placeholder="Detalhe o que o responsável deve realizar..."
        maxLength={LIMITES.textoLongo}
        defaultValue={instrucaoAtual ?? ''}
        error={errors.instrucao?.message}
        {...register('instrucao')}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || !mudou}>
          {isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
