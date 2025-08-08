import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast from './Toast';

// Mock para FontAwesomeIcon
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: props => <span data-testid='fa-icon' {...props} />,
}));

// Mock para setTimeout e clearTimeout
jest.useFakeTimers();

describe('Toast', () => {
  const baseProps = {
    id: '1',
    message: 'Mensagem de teste',
    onClose: jest.fn(),
    duration: 1000,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    baseProps.onClose.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renderiza mensagem e botão de fechar', () => {
    act(() => {
      render(<Toast {...baseProps} />);
      jest.advanceTimersByTime(20); // Avança o tempo para a animação de entrada
    });

    expect(screen.getByText('Mensagem de teste')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fechar/i })).toBeInTheDocument();
  });

  it('renderiza título se fornecido', () => {
    act(() => {
      render(<Toast {...baseProps} title='Título' />);
      jest.advanceTimersByTime(20);
    });
    expect(screen.getByText('Título')).toBeInTheDocument();
  });

  it('chama onClose ao clicar no botão de fechar', () => {
    act(() => {
      render(<Toast {...baseProps} />);
      jest.advanceTimersByTime(20);
    });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /fechar/i }));
      jest.advanceTimersByTime(300); // Avança para a animação de saída
    });

    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it('exibe barra de progresso se duration > 0', () => {
    act(() => {
      render(<Toast {...baseProps} duration={2000} />);
      jest.advanceTimersByTime(20);
    });

    const alert = screen.getByRole('alert');
    expect(alert.querySelector('.toast-progress')).toBeInTheDocument();
  });

  it('renderiza ação customizada se fornecida', () => {
    render(<Toast {...baseProps} action={<button>Desfazer</button>} />);
    expect(screen.getByText('Desfazer')).toBeInTheDocument();
  });

  it('aplica classes de tipo corretamente', () => {
    render(<Toast {...baseProps} type='success' />);
    expect(screen.getByRole('alert')).toHaveClass('toast-success');
  });
});
