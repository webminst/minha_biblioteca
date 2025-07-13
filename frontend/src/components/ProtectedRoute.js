// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    // Redireciona para a página de login se não estiver autenticado
    return <Navigate to="/login" replace />;
  }
  // Renderiza os componentes filhos ou o Outlet se estiver autenticado
  return children ? children : <Outlet />;
}

export default ProtectedRoute;