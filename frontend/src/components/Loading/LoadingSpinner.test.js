import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renderiza o spinner e o texto padrão', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  it('permite customizar o texto', () => {
    render(<LoadingSpinner text='Aguarde...' />);
    expect(screen.getByText(/aguarde/i)).toBeInTheDocument();
  });

  it('aplica classes de tamanho e cor', () => {
    render(<LoadingSpinner size='large' color='secondary' />);
    const container = document.querySelector('.loading-spinner-container');
    expect(container).toHaveClass('large');
    expect(document.querySelector('.loading-spinner')).toHaveClass('secondary');
  });

  it('não renderiza texto se text for vazio', () => {
    render(<LoadingSpinner text={null} />);
    expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
  });
});
