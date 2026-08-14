import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';

import { maquinaSchema, type MaquinaFormData } from '../schemas/maquinaSchema';

type MaquinaFormProps = {
  nomeInicial?: string;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (data: MaquinaFormData) => Promise<void>;
};

export function MaquinaForm({
  nomeInicial = '',
  isSubmitting,
  submitLabel = 'Salvar',
  onSubmit,
}: MaquinaFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<MaquinaFormData>({
    resolver: zodResolver(maquinaSchema),
    defaultValues: { nome: nomeInicial },
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Nome da máquina"
        placeholder="Ex: FBOX, Fast Loop, Vick"
        error={errors.nome?.message}
        disabled={isSubmitting}
        {...register('nome')}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : submitLabel}
      </Button>
    </form>
  );
}
