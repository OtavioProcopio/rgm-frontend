import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Textarea } from '@/shared/components/Textarea/Textarea';
import { LIMITES } from '@/shared/lib/limites';

import { comentarioSchema, type ComentarioFormData } from '../schemas/solicitacaoSchema';

type Props = {
  isPending?: boolean;
  /** Devolve `false` quando o envio falhou: o texto digitado fica para nova tentativa. */
  onSubmit: (data: ComentarioFormData) => unknown;
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

  async function handleFormSubmit(data: ComentarioFormData) {
    const enviado = await onSubmit(data);
    if (enviado !== false) reset();
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <Textarea
        label="Novo comentário"
        placeholder="Escreva um comentário..."
        error={errors.comentario?.message}
        maxLength={LIMITES.textoLongo}
        {...register('comentario')}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Enviando...' : 'Enviar comentário'}
      </Button>
    </form>
  );
}
