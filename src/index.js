import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';

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
    <Router>
      {/* Componente principal da aplicação */}
      <App />
    </Router>
  </React.StrictMode>
);

// Inicia medição de performance (descomente para habilitar)
// reportWebVitals(console.log);

// Exporta função de métricas para uso opcional
export { reportWebVitals };
