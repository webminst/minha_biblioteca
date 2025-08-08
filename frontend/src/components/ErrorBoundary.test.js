import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Componente que lança erro propositalmente
function ProblemChild() {
  throw new Error('Erro de teste!');
}

describe('ErrorBoundary', () => {
  it('renderiza children normalmente quando não há erro', () => {
    render(
      <ErrorBoundary>
        <div>Sem erro</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Sem erro')).toBeInTheDocument();
  });

  it('exibe UI de fallback ao capturar erro', () => {
    // Suprime o erro esperado no console
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument();
    expect(screen.getByText(/recarregar página/i)).toBeInTheDocument();
    console.error.mockRestore();
  });

  it('exibe detalhes do erro em desenvolvimento', () => {
    // Suprime o erro esperado no console
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/detalhes do erro/i)).toBeInTheDocument();
    process.env.NODE_ENV = originalEnv;
    console.error.mockRestore();
  });
});
