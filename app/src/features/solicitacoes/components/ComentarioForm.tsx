import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Textarea } from '@/shared/components/Textarea/Textarea';

import { comentarioSchema, type ComentarioFormData } from '../schemas/solicitacaoSchema';

type Props = {
  isPending?: boolean;
  onSubmit: (data: ComentarioFormData) => void;
};

export function ComentarioForm({ isPending, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComentarioFormData>({
    resolver: zodResolver(comentarioSchema),
  });

  function handleFormSubmit(data: ComentarioFormData) {
    onSubmit(data);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <Textarea
        label="Novo comentário"
        placeholder="Escreva um comentário..."
        error={errors.comentario?.message}
        {...register('comentario')}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Enviando...' : 'Enviar comentário'}
      </Button>
    </form>
  );
}
