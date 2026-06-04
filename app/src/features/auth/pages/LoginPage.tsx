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
    <section className="rounded-md border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
          RGM
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-950 dark:text-gray-50">
          Acesse sua conta
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
          Acesse sua conta para gerenciar solicitações, modelos e evidências.
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
