import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import App from './App';
import './index.css';

// Configuração do histórico personalizado
const history = createBrowserHistory({
  // Configuração para o futuro do React Router
  future: {
    v7_startTransition: true, // Habilita o uso de startTransition
    v7_relativeSplatPath: true // Habilita o comportamento futuro para rotas splat
  }
});

/**
 * Ponto de entrada da aplicação React
 * Configura o roteamento e renderiza o componente App principal
 * Utiliza React 18 com createRoot para melhor performance
 */

// Função para reportar métricas de performance (opcional)
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Cria a raiz do React 18 no elemento DOM 'root'
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza a aplicação com roteamento
root.render(
  <React.StrictMode>
    {/* Router para navegação SPA (Single Page Application) */}
    <Router 
      history={history}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      {/* Componente principal da aplicação */}
      <App />
    </Router>
  </React.StrictMode>
);

// Inicia medição de performance (descomente para habilitar)
// reportWebVitals(console.log);
