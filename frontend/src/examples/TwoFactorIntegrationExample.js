// frontend/src/examples/TwoFactorIntegrationExample.js
// Exemplo de como integrar os componentes 2FA no App principal

import React, { useState, useEffect } from 'react';
import {
  TwoFactorSetup,
  TwoFactorLogin,
  TwoFactorManagement,
} from '../components';
import authService from '../services/authService';

/**
 * Exemplo de integração completa dos componentes 2FA
 *
 * Este arquivo mostra como usar os componentes em diferentes cenários:
 * 1. Durante o processo de login
 * 2. Na configuração inicial do 2FA
 * 3. No gerenciamento de configurações de segurança
 */
const TwoFactorIntegrationExample = () => {
  const [user, setUser] = useState(null);
  const [showTwoFactorLogin, setShowTwoFactorLogin] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showTwoFactorManagement, setShowTwoFactorManagement] = useState(false);
  const [loginData, setLoginData] = useState(null);

  // ========================================
  // CENÁRIO 1: INTEGRAÇÃO COM PROCESSO DE LOGIN
  // ========================================

  const handleLogin = async credentials => {
    try {
      const response = await authService.login(credentials);

      if (response.data.requires2FA) {
        // Usuário tem 2FA habilitado, mostrar tela de verificação
        setLoginData({ email: credentials.email });
        setShowTwoFactorLogin(true);
      } else {
        // Login completo sem 2FA
        setUser(response.data.user);
        console.log('Login realizado com sucesso');
      }
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  const handleTwoFactorVerification = async verificationData => {
    try {
      const response = await authService.verifyTwoFactor(
        verificationData.code,
        verificationData.isBackupCode,
      );

      if (response.data.success) {
        setUser(response.data.user);
        setShowTwoFactorLogin(false);
        setLoginData(null);
        console.log('Autenticação 2FA concluída com sucesso');
      }
    } catch (error) {
      console.error('Erro na verificação 2FA:', error);
      // Erro será mostrado pelo componente TwoFactorLogin
    }
  };

  const handleCancelTwoFactorLogin = () => {
    setShowTwoFactorLogin(false);
    setLoginData(null);
    authService.logout(); // Limpa o token partial_auth
  };

  // ========================================
  // CENÁRIO 2: CONFIGURAÇÃO INICIAL DO 2FA
  // ========================================

  const handleStartTwoFactorSetup = () => {
    setShowTwoFactorSetup(true);
  };

  const handleTwoFactorSetupComplete = setupData => {
    console.log('2FA configurado com sucesso:', setupData);
    setShowTwoFactorSetup(false);

    // Opcional: atualizar dados do usuário
    // setUser(prevUser => ({ ...prevUser, twoFactorEnabled: true }));
  };

  const handleCancelTwoFactorSetup = () => {
    setShowTwoFactorSetup(false);
  };

  // ========================================
  // CENÁRIO 3: GERENCIAMENTO DE 2FA
  // ========================================

  const handleOpenTwoFactorManagement = () => {
    setShowTwoFactorManagement(true);
  };

  const handleCloseTwoFactorManagement = () => {
    setShowTwoFactorManagement(false);
  };

  // ========================================
  // RENDERIZAÇÃO CONDICIONAL
  // ========================================

  // Durante processo de login com 2FA
  if (showTwoFactorLogin && loginData) {
    return (
      <TwoFactorLogin
        email={loginData.email}
        onSubmit={handleTwoFactorVerification}
        onCancel={handleCancelTwoFactorLogin}
        loading={false}
        error={null}
      />
    );
  }

  // Durante configuração do 2FA
  if (showTwoFactorSetup) {
    return (
      <TwoFactorSetup
        onComplete={handleTwoFactorSetupComplete}
        onCancel={handleCancelTwoFactorSetup}
      />
    );
  }

  // Durante gerenciamento do 2FA
  if (showTwoFactorManagement) {
    return (
      <div>
        <TwoFactorManagement />
        <button onClick={handleCloseTwoFactorManagement}>Voltar</button>
      </div>
    );
  }

  // ========================================
  // INTERFACE PRINCIPAL (EXEMPLO)
  // ========================================

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Exemplo de Integração 2FA</h1>

      {!user ? (
        <div>
          <h2>Login</h2>
          <LoginForm onSubmit={handleLogin} />
        </div>
      ) : (
        <div>
          <h2>Bem-vindo, {user.name}!</h2>

          <div style={{ marginTop: '30px' }}>
            <h3>Ações Disponíveis:</h3>

            <button
              onClick={handleStartTwoFactorSetup}
              style={{ margin: '10px', padding: '10px 20px' }}
            >
              🔐 Configurar Autenticação de Dois Fatores
            </button>

            <button
              onClick={handleOpenTwoFactorManagement}
              style={{ margin: '10px', padding: '10px 20px' }}
            >
              ⚙️ Gerenciar 2FA
            </button>

            <button
              onClick={() => {
                authService.logout();
                setUser(null);
              }}
              style={{ margin: '10px', padding: '10px 20px' }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// COMPONENTE DE LOGIN SIMPLES (EXEMPLO)
// ========================================

const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <div style={{ marginBottom: '15px' }}>
        <label>Email:</label>
        <input
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Senha:</label>
        <input
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <button
        type='submit'
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
        }}
      >
        Entrar
      </button>
    </form>
  );
};

export default TwoFactorIntegrationExample;

// ========================================
// INSTRUÇÕES DE USO
// ========================================

/*
COMO USAR ESTE EXEMPLO:

1. INTEGRAÇÃO COM REACT ROUTER:

   import { TwoFactorSetup, TwoFactorLogin, TwoFactorManagement } from './components';

   // Em suas rotas:
   <Route path="/setup-2fa" component={TwoFactorSetup} />
   <Route path="/security" component={TwoFactorManagement} />

2. INTEGRAÇÃO COM REDUX (se estiver usando):

   // Dispatch actions para atualizar estado global
   const handleTwoFactorSetupComplete = (setupData) => {
     dispatch(updateUserTwoFactorStatus(true));
   };

3. INTEGRAÇÃO COM CONTEXT API:

   const { user, updateUser } = useContext(AuthContext);

   const handleTwoFactorSetupComplete = (setupData) => {
     updateUser({ ...user, twoFactorEnabled: true });
   };

4. VERIFICAÇÃO AUTOMÁTICA DE 2FA:

   useEffect(() => {
     const checkTwoFactorStatus = async () => {
       if (authService.isAuthenticated()) {
         try {
           const has2FA = await authService.hasTwoFactorEnabled();
           // Atualizar estado conforme necessário
         } catch (error) {
           console.error('Erro ao verificar status 2FA:', error);
         }
       }
     };

     checkTwoFactorStatus();
   }, []);

5. PROTEÇÃO DE ROTAS:

   const ProtectedRoute = ({ children, requireAdmin = false }) => {
     const [loading, setLoading] = useState(true);
     const [authorized, setAuthorized] = useState(false);

     useEffect(() => {
       const checkAuth = async () => {
         if (!authService.isAuthenticated()) {
           // Redirecionar para login
           return;
         }

         if (authService.needsTwoFactorVerification()) {
           // Redirecionar para verificação 2FA
           return;
         }

         // Usuário autorizado
         setAuthorized(true);
         setLoading(false);
       };

       checkAuth();
     }, []);

     if (loading) return <div>Carregando...</div>;
     if (!authorized) return <Navigate to="/login" />;

     return children;
   };
*/
