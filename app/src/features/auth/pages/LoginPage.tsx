import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/app/providers/authContext';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/loginSchema';
import { ApiError } from '@/shared/api/apiError';
import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';

export function LoginPage() {
  const { login } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  async function onSubmit(data: LoginFormData) {
    setLoginError(null);

    try {
      await login(data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setLoginError('E-mail ou senha inválidos.');
        return;
      }

      setLoginError('Não foi possível entrar agora. Tente novamente em instantes.');
    }
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/95 sm:p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto inline-flex rounded-md border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-700">
          <img src="/logo-rgm-autoparts.png" alt="RGM Auto Parts" className="h-16 w-auto" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-950 dark:text-white">
          Acesso ao RGM
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Entre para gerenciar usuários, máquinas, modelos e solicitações.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="admin@rgm.com"
          error={errors.email?.message}
          disabled={isSubmitting}
          {...register('email')}
        />

        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          error={errors.senha?.message}
          disabled={isSubmitting}
          {...register('senha')}
        />

        {loginError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
            {loginError}
          </div>
        ) : null}

        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </section>
  );
}
