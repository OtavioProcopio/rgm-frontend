import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';

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
        {...register('nome')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Perfil</span>
          <select
            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            disabled={isSubmitting}
            {...register('perfil')}
          >
            {perfilOptions.map((option) => (
              <option key={option} value={option}>
                {getPerfilLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 self-end rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <input type="checkbox" disabled={isSubmitting} {...register('ativo')} />
          Usuário ativo
        </label>
      </div>

      {isExterno ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-200">
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
        {...register('nome')}
      />
      <Input
        label="E-mail"
        type="email"
        error={errors.email?.message}
        disabled={isSubmitting || usuario.perfil === 'EXTERNO'}
        {...register('email')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ReadOnlyField label="Perfil" value={getPerfilLabel(usuario.perfil)} />
        <ReadOnlyField label="Status" value={usuario.ativo ? 'Ativo' : 'Inativo'} />
      </div>

      {usuario.perfil === 'EXTERNO' ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
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
      <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        {value}
      </div>
    </div>
  );
}

function getPerfilLabel(perfil: PerfilUsuario) {
  const labels: Record<PerfilUsuario, string> = {
    ADMINISTRADOR: 'Administrador',
    GESTOR: 'Gestor',
    OPERADOR: 'Operador',
    EXTERNO: 'Externo',
  };

  return labels[perfil];
}
