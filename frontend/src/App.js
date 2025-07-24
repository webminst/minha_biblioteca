// src/App.js
import React, { useState, useEffect } from 'react';
import './config/fontAwesome'; // Importa a configuração do Font Awesome
import { Routes, Route, useNavigate } from 'react-router-dom';

// Componentes de infraestrutura
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast/ToastContainer';

// Páginas públicas
import Home from './pages/Home';
import Sermons from './pages/Sermons';
import Studies from './pages/Studies';
import Books from './pages/Books';
import Agenda from './pages/Agenda';
import About from './pages/About';
import Contact from './pages/Contact';
import SupportPage from './pages/SupportPage';
import BiblePage from './pages/BiblePage';
import ContentDetail from './pages/ContentDetail';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';

// Componentes de autenticação e admin
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Componentes 2FA
import { TwoFactorSetup, TwoFactorLogin, TwoFactorManagement } from './components';
import TwoFactorProtectedRoute from './components/TwoFactorProtectedRoute';

// Componentes administrativos
import AdminSermonsList from './components/admin/AdminSermonsList';
import SermonForm from './components/admin/SermonForm';
import AdminStudiesList from './components/admin/AdminStudiesList';
import StudyForm from './components/admin/StudyForm';
import AdminBooksList from './components/admin/AdminBooksList';
import BookForm from './components/admin/BookForm';
import Audit from './pages/admin/Audit';

import './App.css';

/**
 * Componente App - Componente raiz da aplicação
 * Gerencia autenticação, rotas públicas e protegidas
 * Mantém estado global de autenticação e controla navegação
 */
function App() {
  const navigate = useNavigate();

  // Estados para controle de autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Verifica se usuário já está logado ao carregar a aplicação
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('userRole');

    if (token && storedUsername && storedRole) {
      // Restaura sessão do usuário logado
      setIsAuthenticated(true);
      setUser({
        username: storedUsername,
        role: storedRole,
        token
      });
    }
  }, []);

  // Handler para sucesso no login
  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Handler para logout
  const handleLogout = () => {
    // Remove dados do localStorage
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');

    // Limpa estado da aplicação
    setIsAuthenticated(false);
    setUser(null);

    // Redireciona para home
    navigate('/');
  };

  return (
    <ToastProvider>
      <ErrorBoundary>
        {/* Componente para scroll automático ao navegar */}
        <ScrollToTop />

        <Routes>
          {/* Layout principal com header, footer e navegação */}
          <Route path="/" element={<Layout />}>

            {/* ========== ROTAS PÚBLICAS ========== */}
            {/* Página inicial */}
            <Route index element={<Home />} />

            {/* Páginas de listagem de conteúdo */}
            <Route path="sermoes" element={<Sermons />} />
            <Route path="estudos" element={<Studies />} />
            <Route path="livros" element={<Books />} />

            {/* Páginas de detalhes de conteúdo */}
            <Route path="sermoes/:contentId" element={<ContentDetail />} />
            <Route path="estudos/:contentId" element={<ContentDetail />} />
            <Route path="livros/:contentId" element={<ContentDetail />} />

            {/* Páginas institucionais */}
            <Route path="agenda" element={<Agenda />} />
            <Route path="sobre" element={<About />} />
            <Route path="contato" element={<Contact />} />
            <Route path="apoie" element={<SupportPage />} />
            <Route path="biblia" element={<BiblePage />} />

            {/* Páginas de funcionalidades */}
            <Route path="busca" element={<SearchResults />} />
            <Route path="login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

            {/* ========== ROTAS 2FA ========== */}
            <Route path="setup-2fa" element={
              <TwoFactorProtectedRoute>
                <TwoFactorSetup />
              </TwoFactorProtectedRoute>
            } />

            <Route path="security" element={
              <TwoFactorProtectedRoute>
                <TwoFactorManagement />
              </TwoFactorProtectedRoute>
            } />

            {/* ========== ROTAS PROTEGIDAS (ADMIN) ========== */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>

              {/* Dashboard administrativo */}
              <Route path="admin/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />

              {/* CRUD de Sermões */}
              <Route path="admin/sermoes" element={<AdminSermonsList />} />
              <Route path="admin/sermoes/novo" element={<SermonForm />} />
              <Route path="admin/sermoes/editar/:id" element={<SermonForm />} />

              {/* CRUD de Estudos */}
              <Route path="admin/estudos" element={<AdminStudiesList />} />
              <Route path="admin/estudos/novo" element={<StudyForm />} />
              <Route path="admin/estudos/editar/:id" element={<StudyForm />} />

              {/* CRUD de Livros */}
              <Route path="admin/livros" element={<AdminBooksList />} />
              <Route path="admin/livros/novo" element={<BookForm />} />
              <Route path="admin/livros/editar/:id" element={<BookForm />} />

              {/* Auditoria e Logs */}
              <Route path="admin/auditoria" element={<Audit />} />

            </Route>

            {/* Página 404 - deve ser a última rota */}
            <Route path="*" element={<NotFound />} />

          </Route>
        </Routes>
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;