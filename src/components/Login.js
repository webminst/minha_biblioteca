// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Para redirecionar após o login
import './Login.css'; // Vamos criar este CSS em seguida

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook para navegação programática

  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário
    setLoading(true);
    setError(''); // Limpa erros anteriores

    try {
      const response = await axios.post('http://localhost:3002/api/auth/login', {
        username,
        password,
      });

      // Se o login for bem-sucedido
      const { token, username: loggedInUsername, role } = response.data;

      // Armazena o token e o usuário no localStorage ou sessionStorage
      // localStorage é persistente, sessionStorage é apagado ao fechar a aba/navegador
      localStorage.setItem('userToken', token);
      localStorage.setItem('username', loggedInUsername);
      localStorage.setItem('userRole', role);

      // Chama a função passada por prop para atualizar o estado de autenticação no App.js
      if (onLoginSuccess) {
        onLoginSuccess({ username: loggedInUsername, role, token });
      }

      // Redireciona para a área administrativa ou dashboard
      navigate('/admin/dashboard');

    } catch (err) {
      console.error('Erro no login:', err);
      // Mensagem de erro mais amigável
      setError(err.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

export default Login;