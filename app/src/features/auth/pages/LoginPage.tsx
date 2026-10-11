import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/app/providers/authContext';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/loginSchema';
import { mensagemDoLogin } from '@/features/auth/lib/mensagemDoLogin';
import { Button } from '@/shared/components/Button/Button';
import { CampoDeSenha } from '@/shared/components/CampoDeSenha/CampoDeSenha';
import { Card } from '@/shared/components/Card/Card';
import { Input } from '@/shared/components/Input/Input';
import { Logo } from '@/shared/components/Logo/Logo';
import { NOME_DO_PRODUTO } from '@/shared/lib/produto';

export function LoginPage() {
  const { login } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  useEffect(() => {
    setFocus('email');
  }, [setFocus]);

  async function onSubmit(data: LoginFormData) {
    setLoginError(null);

    try {
      await login(data);
    } catch (error) {
      setLoginError(mensagemDoLogin(error));
    }
  }

  return (
    <Card as="section" className="rounded-md p-6 shadow-xl sm:p-8">
      <div className="mb-8 text-center">
        <div className="flex justify-center">
          <Logo tamanho="lg" className="mx-auto" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-fg">{NOME_DO_PRODUTO}</h1>
        <p className="mt-1 text-sm text-fg-muted">Gestão de modelos</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          enterKeyHint="next"
          placeholder="nome@empresa.com"
          error={errors.email?.message}
          disabled={isSubmitting}
          {...register('email')}
        />

        <CampoDeSenha
          label="Senha"
          autoComplete="current-password"
          enterKeyHint="go"
          placeholder="Digite sua senha"
          error={errors.senha?.message}
          disabled={isSubmitting}
          {...register('senha')}
        />

        {loginError ? (
          <div
            role="alert"
            className="rounded-md border border-danger bg-danger-soft px-3 py-2 text-sm text-danger-fg"
          >
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
