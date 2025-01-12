import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Login } from '@/pages/auth/Login';
import { Bills } from '@/pages/Bills';
import { AuthGuard } from '@/components/auth/AuthGuard';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <Bills />
      </AuthGuard>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export function Routes() {
  return <RouterProvider router={router} />;
}