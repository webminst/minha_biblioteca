// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirecionar após o login
import useAuth from '../hooks/useAuth'; // NOVO: Hook de autenticação
import './Login.css'; // Vamos criar este CSS em seguida

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook para navegação programática
  const { login, isLoading } = useAuth(); // NOVO: Hook de autenticação

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Usa o novo serviço de autenticação com refresh automático
      const userData = await login(username, password);

      // Verifica se precisa de verificação 2FA
      if (userData?.requires2FA) {
        // Usuário será redirecionado automaticamente pelo TwoFactorProtectedRoute
        navigate('/admin/dashboard');
        return;
      }

      // Chama a função passada por prop para atualizar o estado de autenticação no App.js
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }

      // Redireciona para a área administrativa ou dashboard
      navigate('/admin/dashboard');

    } catch (err) {
      console.error('Erro no login:', err);
      // Mensagem de erro mais amigável
      setError(err.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="username">Usuário:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {/* Indicador de renovação automática */}
      <div className="auth-info">
        <small>
          🔄 Renovação automática de tokens ativa
        </small>
      </div>
    </div>
  );
}

export default Login;