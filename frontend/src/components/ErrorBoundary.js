// src/components/ErrorBoundary.js
import React from 'react';

/**
 * Error Boundary Component
 * Captura erros JavaScript em qualquer lugar da árvore de componentes
 * e exibe uma UI de fallback em vez de crashar a aplicação
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Atualiza o state para que a próxima renderização mostre a UI de fallback
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log do erro para serviços de monitoramento
        console.error('ErrorBoundary capturou um erro:', error, errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Aqui você pode enviar o erro para um serviço de monitoramento
        // como Sentry, LogRocket, etc.
    }

    render() {
        if (this.state.hasError) {
            // UI de fallback customizada
            return (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    margin: '2rem auto',
                    maxWidth: '600px'
                }}>
                    <h2 style={{ color: '#d32f2f', marginBottom: '1rem' }}>
                        Ops! Algo deu errado
                    </h2>
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                        Ocorreu um erro inesperado. Nossa equipe foi notificada.
                    </p>

                    {process.env.NODE_ENV === 'development' && (
                        <details style={{ marginTop: '1rem', textAlign: 'left' }}>
                            <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                                Detalhes do erro (desenvolvimento)
                            </summary>
                            <pre style={{
                                backgroundColor: '#f5f5f5',
                                padding: '1rem',
                                borderRadius: '4px',
                                overflow: 'auto',
                                fontSize: '0.8rem'
                            }}>
                                {this.state.error && this.state.error.toString()}
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}

                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'var(--color-green-ipb)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Recarregar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
