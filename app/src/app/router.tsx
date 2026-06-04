import { Navigate, createBrowserRouter } from 'react-router';

import { AdminLayout } from '@/app/layouts/AdminLayout';
import { AppLayout } from '@/app/layouts/AppLayout';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { AdminRoute } from '@/app/routes/AdminRoute';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/app/routes/PublicOnlyRoute';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { AdminMaquinasPage } from '@/features/admin/pages/AdminMaquinasPage';
import { AdminModelosPage } from '@/features/admin/pages/AdminModelosPage';
import { EditarUsuarioPage } from '@/features/admin/usuarios/pages/EditarUsuarioPage';
import { NovoUsuarioPage } from '@/features/admin/usuarios/pages/NovoUsuarioPage';
import { UsuariosPage } from '@/features/admin/usuarios/pages/UsuariosPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SolicitacoesPage } from '@/features/solicitacoes/pages/SolicitacoesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/admin" replace />,
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
            element: <Navigate to="/app/admin" replace />,
          },
          {
            path: 'solicitacoes',
            element: <SolicitacoesPage />,
          },
          {
            path: 'admin',
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
                  {
                    path: 'maquinas',
                    element: <AdminMaquinasPage />,
                  },
                  {
                    path: 'modelos',
                    element: <AdminModelosPage />,
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
