// src/components/ProtectedRoute.js

import { Navigate, Outlet } from 'react-router-dom';
import TwoFactorProtectedRoute from './TwoFactorProtectedRoute';

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    // Redireciona para a página de login se não estiver autenticado
    return <Navigate to='/login' replace />;
  }

  // Usa TwoFactorProtectedRoute para verificar 2FA
  return (
    <TwoFactorProtectedRoute>
      {children ? children : <Outlet />}
    </TwoFactorProtectedRoute>
  );
}

export default ProtectedRoute;
