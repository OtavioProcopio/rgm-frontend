import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';
import { LIMITES } from '@/shared/lib/limites';
import { rotuloDoPerfil } from '@/shared/lib/rotulos';

import {
  criarUsuarioSchema,
  editarUsuarioSchema,
  type CriarUsuarioFormData,
  type EditarUsuarioFormData,
} from '../schemas/usuarioSchema';
import type {
  CriarUsuarioRequest,
  EditarUsuarioRequest,
  PerfilUsuario,
  Usuario,
} from '../types/usuarioTypes';

type UsuarioFormProps =
  | {
      mode: 'create';
      initialValues?: Partial<CriarUsuarioRequest>;
      isSubmitting?: boolean;
      onSubmit: (data: CriarUsuarioRequest) => Promise<void>;
    }
  | {
      mode: 'edit';
      usuario: Usuario;
      isSubmitting?: boolean;
      onSubmit: (data: EditarUsuarioRequest) => Promise<void>;
    };

const perfilOptions: PerfilUsuario[] = ['ADMINISTRADOR', 'GESTOR', 'OPERADOR', 'EXTERNO'];

export function UsuarioForm(props: UsuarioFormProps) {
  if (props.mode === 'edit') {
    return <EditarUsuarioForm {...props} />;
  }

  return <CriarUsuarioForm {...props} />;
}

function CriarUsuarioForm({
  initialValues,
  isSubmitting,
  onSubmit,
}: Extract<UsuarioFormProps, { mode: 'create' }>) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    control,
  } = useForm<CriarUsuarioFormData>({
    resolver: zodResolver(criarUsuarioSchema),
    defaultValues: {
      nome: initialValues?.nome ?? '',
      email: initialValues?.email ?? '',
      senha: initialValues?.senha ?? '',
      perfil: initialValues?.perfil ?? 'OPERADOR',
      ativo: initialValues?.ativo ?? true,
    },
  });
  const perfil = useWatch({ control, name: 'perfil' });
  const isExterno = perfil === 'EXTERNO';

  useEffect(() => {
    if (isExterno) {
      setValue('email', '');
      setValue('senha', '');
    }
  }, [isExterno, setValue]);

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((data) =>
        onSubmit({
          nome: data.nome,
          email: data.email || undefined,
          senha: data.senha || undefined,
          perfil: data.perfil,
          ativo: data.ativo,
        }),
      )}
    >
      <Input
        label="Nome"
        error={errors.nome?.message}
        disabled={isSubmitting}
        maxLength={LIMITES.usuarioNome}
        {...register('nome')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-fg">
          <span>Perfil</span>
          <select
            className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-fg"
            disabled={isSubmitting}
            {...register('perfil')}
          >
            {perfilOptions.map((option) => (
              <option key={option} value={option}>
                {rotuloDoPerfil[option]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-h-11 items-center gap-2 self-end rounded-md border border-line bg-surface-muted px-3 py-3 text-sm font-medium text-fg">
          <input type="checkbox" disabled={isSubmitting} {...register('ativo')} />
          Usuário ativo
        </label>
      </div>

      {isExterno ? (
        <div className="rounded-md border border-success bg-success-soft p-4 text-sm text-success-fg">
          Prestador externo não acessa o sistema. Ele pode ser vinculado a solicitações por um
          gestor ou administrador.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="E-mail"
            type="email"
            error={errors.email?.message}
            disabled={isSubmitting}
            maxLength={LIMITES.usuarioEmail}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            error={errors.senha?.message}
            disabled={isSubmitting}
            {...register('senha')}
          />
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar usuário'}
      </Button>
    </form>
  );
}

function EditarUsuarioForm({
  isSubmitting,
  onSubmit,
  usuario,
}: Extract<UsuarioFormProps, { mode: 'edit' }>) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<EditarUsuarioFormData>({
    resolver: zodResolver(editarUsuarioSchema),
    defaultValues: {
      nome: usuario.nome,
      email: usuario.email ?? '',
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((data) =>
        onSubmit({
          nome: data.nome,
          email: data.email,
        }),
      )}
    >
      <Input
        label="Nome"
        error={errors.nome?.message}
        disabled={isSubmitting}
        maxLength={LIMITES.usuarioNome}
        {...register('nome')}
      />
      <Input
        label="E-mail"
        type="email"
        error={errors.email?.message}
        disabled={isSubmitting || usuario.perfil === 'EXTERNO'}
        maxLength={LIMITES.usuarioEmail}
        {...register('email')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ReadOnlyField label="Perfil" value={rotuloDoPerfil[usuario.perfil]} />
        <ReadOnlyField label="Status" value={usuario.ativo ? 'Ativo' : 'Inativo'} />
      </div>

      {usuario.perfil === 'EXTERNO' ? (
        <div className="rounded-md border border-warning bg-warning-soft p-4 text-sm text-warning-fg">
          Prestador externo não possui login no sistema. O backend atual pode recusar edição pelo
          caso de uso comum.
        </div>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </form>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-fg">{label}</span>
      <div className="rounded-md border border-line bg-surface-muted px-3 py-2 text-sm text-fg-muted">
        {value}
      </div>
    </div>
  );
}
