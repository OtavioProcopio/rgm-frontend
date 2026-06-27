import { Navigate, createBrowserRouter } from 'react-router';

import { AdminLayout } from '@/app/layouts/AdminLayout';
import { AppLayout } from '@/app/layouts/AppLayout';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { AdminRoute } from '@/app/routes/AdminRoute';
import { ModeloManagementRoute } from '@/app/routes/ModeloManagementRoute';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/app/routes/PublicOnlyRoute';

import { EditarModeloPage } from '@/features/admin/modelos/pages/EditarModeloPage';
import { ModeloDetalhePage } from '@/features/admin/modelos/pages/ModeloDetalhePage';
import { ModelosPage as AdminModelosPage } from '@/features/admin/modelos/pages/ModelosPage';
import { NovoModeloPage } from '@/features/admin/modelos/pages/NovoModeloPage';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { EditarUsuarioPage } from '@/features/admin/usuarios/pages/EditarUsuarioPage';
import { NovoUsuarioPage } from '@/features/admin/usuarios/pages/NovoUsuarioPage';
import { UsuariosPage } from '@/features/admin/usuarios/pages/UsuariosPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { PerfilPage } from '@/features/auth/pages/PerfilPage';
import { ModelosPage } from '@/features/modelos/pages/ModelosPage';
import { DashboardPage } from '@/features/solicitacoes/pages/DashboardPage';
import { NovaSolicitacaoPage } from '@/features/solicitacoes/pages/NovaSolicitacaoPage';
import { RelatoriosPage } from '@/features/solicitacoes/pages/RelatoriosPage';
import { SolicitacaoDetalhePage } from '@/features/solicitacoes/pages/SolicitacaoDetalhePage';
import { SolicitacoesPage } from '@/features/solicitacoes/pages/SolicitacoesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/solicitacoes" replace />,
  },
  {
    element: <PublicLayout />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            path: '/login',
            element: <LoginPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/app/solicitacoes" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'relatorios',
            element: <RelatoriosPage />,
          },
          {
            path: 'perfil',
            element: <PerfilPage />,
          },
          {
            path: 'solicitacoes',
            element: <SolicitacoesPage />,
          },
          {
            path: 'solicitacoes/nova',
            element: <NovaSolicitacaoPage />,
          },
          {
            path: 'solicitacoes/:id',
            element: <SolicitacaoDetalhePage />,
          },
          {
            path: 'modelos',
            element: <ModelosPage />,
          },
          {
            path: 'modelos/novo',
            element: <NovoModeloPage backPath="/app/modelos" />,
          },
          {
            path: 'modelos/:id',
            element: <ModeloDetalhePage />,
          },
          {
            path: 'admin',
            children: [
              {
                element: <AdminRoute />,
                children: [
                  {
                    element: <AdminLayout />,
                    children: [
                      {
                        index: true,
                        element: <AdminDashboardPage />,
                      },
                      {
                        path: 'usuarios',
                        element: <UsuariosPage />,
                      },
                      {
                        path: 'usuarios/novo',
                        element: <NovoUsuarioPage />,
                      },
                      {
                        path: 'usuarios/:id/editar',
                        element: <EditarUsuarioPage />,
                      },
                    ],
                  },
                ],
              },
              {
                element: <ModeloManagementRoute />,
                children: [
                  {
                    element: <AdminLayout />,
                    children: [
                      {
                        path: 'modelos',
                        element: <AdminModelosPage />,
                      },
                      {
                        path: 'modelos/novo',
                        element: <NovoModeloPage />,
                      },
                      {
                        path: 'modelos/:id',
                        element: <ModeloDetalhePage />,
                      },
                      {
                        path: 'modelos/:id/editar',
                        element: <EditarModeloPage />,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
