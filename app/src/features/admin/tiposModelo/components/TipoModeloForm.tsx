import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';
import { LIMITES } from '@/shared/lib/limites';

import { tipoModeloSchema, type TipoModeloFormData } from '../schemas/tipoModeloSchema';

type TipoModeloFormProps = {
  nomeInicial?: string;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (data: TipoModeloFormData) => Promise<void>;
};

export function TipoModeloForm({
  nomeInicial = '',
  isSubmitting,
  submitLabel = 'Salvar',
  onSubmit,
}: TipoModeloFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<TipoModeloFormData>({
    resolver: zodResolver(tipoModeloSchema),
    defaultValues: { nome: nomeInicial },
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Nome do tipo de modelo"
        placeholder="Ex: Resina, Aço inox"
        error={errors.nome?.message}
        disabled={isSubmitting}
        maxLength={LIMITES.tipoModeloNome}
        {...register('nome')}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : submitLabel}
      </Button>
    </form>
  );
}
