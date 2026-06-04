import { Navigate, createBrowserRouter } from 'react-router';

import { AdminLayout } from '@/app/layouts/AdminLayout';
import { AppLayout } from '@/app/layouts/AppLayout';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/app/routes/PublicOnlyRoute';
import { AdminPage } from '@/features/admin/pages/AdminPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ModelosPage } from '@/features/modelos/pages/ModelosPage';
import { SolicitacoesPage } from '@/features/solicitacoes/pages/SolicitacoesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app" replace />,
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
            path: 'solicitacoes',
            element: <SolicitacoesPage />,
          },
          {
            path: 'modelos',
            element: <ModelosPage />,
          },
          {
            path: 'admin',
            element: <ProtectedRoute allowedProfiles={['ADMINISTRADOR']} />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  {
                    index: true,
                    element: <AdminPage />,
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
