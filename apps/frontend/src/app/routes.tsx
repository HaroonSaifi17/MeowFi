import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import GlobalLayout from './layout/GlobleLayout';
import TimeVaultPage from './pages/TimeVaultPage';
import LiquidFaucetPage from './pages/LiquidFaucetPage';
import { Suspense } from 'react';
import AdminLoginPage from './pages/AdminLogin';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AuthGuard from '@/features/admin/components/AuthGuard';
import VerifyRole from './pages/VerifyRole';
import UserDashboardPage from './pages/UserDashboardPage';

const router = createBrowserRouter([
  {
    element: <GlobalLayout />,
    children: [
      {
        path: '/',
        element: <TimeVaultPage />,
      },
      {
        path: '/faucet',
        element: <LiquidFaucetPage />,
      },
      {
        path: '/verify',
        element: <VerifyRole />,
      },
      {
        path: '/dashboard',
        element: <UserDashboardPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/dashboard',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <AuthGuard>
          <AdminDashboardPage />
        </AuthGuard>
      </Suspense>
    ),
  },
]);

export const AppRoutes = () => <RouterProvider router={router} />;
