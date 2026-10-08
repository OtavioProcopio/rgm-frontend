import { cn } from '@/shared/lib/cn';

const ALTURA = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
};

type LogoProps = {
  tamanho?: keyof typeof ALTURA;
  className?: string;
};

/**
 * Logo da empresa sobre a placa `logo-plate`: transparente no tema claro, clara no escuro.
 * A margem negativa devolve o espaço da placa, para o logo ocupar o mesmo lugar de antes.
 */
export function Logo({ tamanho = 'md', className }: LogoProps) {
  return (
    <span className={cn('inline-flex rounded-md bg-logo-plate p-1 -m-1', className)}>
      <img
        src="/logo-rgm-autoparts.png"
        alt="RGM Auto Parts"
        className={cn('w-auto', ALTURA[tamanho])}
      />
    </span>
  );
}
