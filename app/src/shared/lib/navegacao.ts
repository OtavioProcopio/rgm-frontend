import type { PerfilUsuario } from '@/features/auth/types/authTypes';
import { canAccessAdmin, canManageModelos } from '@/shared/lib/permissions';

export type DestinoDeNavegacao = {
  id: 'dashboard' | 'solicitacoes' | 'modelos' | 'admin' | 'usuarios';
  to: string;
  rotulo: string;
  end: boolean;
};

function destinosComuns(perfil: PerfilUsuario | undefined): DestinoDeNavegacao[] {
  const rotaModelos = canManageModelos(perfil) ? '/app/admin/modelos' : '/app/modelos';
  return [
    { id: 'dashboard', to: '/app/dashboard', rotulo: 'Dashboard', end: false },
    { id: 'solicitacoes', to: '/app/solicitacoes', rotulo: 'Solicitações', end: false },
    { id: 'modelos', to: rotaModelos, rotulo: 'Modelos', end: false },
  ];
}

function destinosDeAdministrador(): DestinoDeNavegacao[] {
  return [
    { id: 'admin', to: '/app/admin', rotulo: 'Painel Admin', end: true },
    { id: 'usuarios', to: '/app/admin/usuarios', rotulo: 'Usuários', end: false },
  ];
}

export function destinosDeNavegacao(perfil: PerfilUsuario | undefined): DestinoDeNavegacao[] {
  const comuns = destinosComuns(perfil);
  return canAccessAdmin(perfil) ? [...comuns, ...destinosDeAdministrador()] : comuns;
}
