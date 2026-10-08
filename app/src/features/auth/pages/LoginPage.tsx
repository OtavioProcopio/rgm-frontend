import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/app/providers/authContext';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/loginSchema';
import { ApiError } from '@/shared/api/apiError';
import { Button } from '@/shared/components/Button/Button';
import { Card } from '@/shared/components/Card/Card';
import { Input } from '@/shared/components/Input/Input';
import { Logo } from '@/shared/components/Logo/Logo';

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
    <Card as="section" className="rounded-md p-6 shadow-xl sm:p-8">
      <div className="mb-8 text-center">
        <div className="flex justify-center">
          <Logo tamanho="lg" className="mx-auto" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-fg">Rei Auto Parts</h1>
        <h2 className="mt-1 text-2xl font-semibold text-fg">Gestão de Modelos</h2>
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
          <div className="rounded-md border border-danger bg-danger-soft px-3 py-2 text-sm text-danger-fg">
            {loginError}
          </div>
        ) : null}

        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </Card>
  );
}
