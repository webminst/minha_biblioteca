// src/App.js
import React, { useState, useEffect } from 'react';
import ScrollToTop from './components/ScrollToTop';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Sermons from './pages/Sermons';
import Studies from './pages/Studies';
import Books from './pages/Books';
import Agenda from './pages/Agenda';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './components/Login';
import NotFound from './pages/NotFound';
import SupportPage from './pages/SupportPage';
import ContentDetail from './pages/ContentDetail';
import SearchResults from './pages/SearchResults';
import ProtectedRoute from './components/ProtectedRoute'; // Importa o ProtectedRoute
import Dashboard from './components/Dashboard'; // Vamos criar este em seguida
import AdminSermonsList from './components/admin/AdminSermonsList'; // NOVO
import SermonForm from './components/admin/SermonForm';             // NOVO
import './App.css';

// Todas as importações acima são utilizadas no componente App.

function App() {
  const navigate = useNavigate();

  // Estado para armazenar informações do usuário autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Para guardar username, role, etc.

  // Verifica o localStorage ao carregar a aplicação para ver se já há um token
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('userRole');
    if (token && storedUsername && storedRole) {
      // Aqui você poderia fazer uma requisição para validar o token no backend
      // Por simplicidade, vamos apenas considerar que se o token existe, está logado.
      setIsAuthenticated(true);
      setUser({ username: storedUsername, role: storedRole, token });
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/'); // Redireciona para home após logout
  };


  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sermoes" element={<Sermons />} />
          <Route path="sermoes/:contentId" element={<ContentDetail />} />
          <Route path="estudos" element={<Studies />} />
          <Route path="estudos/:contentId" element={<ContentDetail />} />
          <Route path="livros" element={<Books />} />
          <Route path="livros/:contentId" element={<ContentDetail />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="sobre" element={<About />} />
          <Route path="contato" element={<Contact />} />
          <Route path="busca" element={<SearchResults />} />
          <Route path="apoie" element={<SupportPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

          {/* Rotas Protegidas (apenas acessíveis após login) */}
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/admin/dashboard" element={<Dashboard user={user} />} />
            {/* Futuras rotas de CRUD: /admin/sermoes/novo, /admin/estudos/editar/:id, etc. */}
            {/* Rotas CRUD para Sermões */}
            <Route path="/admin/sermoes" element={<AdminSermonsList />} />
            <Route path="/admin/sermoes/novo" element={<SermonForm />} />
            <Route path="/admin/sermoes/editar/:id" element={<SermonForm />} />

            {/* Em breve: Rotas CRUD para Estudos e Livros */}
            {/* <Route path="/admin/estudos" element={<AdminStudiesList />} /> */}
            {/* <Route path="/admin/estudos/novo" element={<StudyForm />} /> */}
            {/* <Route path="/admin/estudos/editar/:id" element={<StudyForm />} /> */}

          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;