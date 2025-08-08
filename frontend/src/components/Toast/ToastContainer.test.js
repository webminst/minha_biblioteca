import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './ToastContainer';

// Mock Toast component to isolate ToastContainer logic
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
jest.mock('./Toast', () => ({
  __esModule: true,
  default: ({ message, onClose, ...props }) => (
    <div role='alert' data-testid='toast' onClick={onClose} {...props}>
      {message}
    </div>
  ),
}));

describe('ToastProvider & ToastContainer', () => {
  jest.setTimeout(15000);
  function TestComponent() {
    const {
      addToast,
      removeToast,
      clearToasts,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      toasts,
    } = useToast();
    return (
      <div>
        <button onClick={() => addToast('Mensagem padrão')}>Add Toast</button>
        <button onClick={() => showSuccess('Sucesso!')}>Show Success</button>
        <button onClick={() => showError('Erro!')}>Show Error</button>
        <button onClick={() => showWarning('Aviso!')}>Show Warning</button>
        <button onClick={() => showInfo('Info!')}>Show Info</button>
        <button onClick={clearToasts}>Clear Toasts</button>
        <div data-testid='toast-count'>{toasts.length}</div>
      </div>
    );
  }

  // Usar timers reais para garantir funcionamento correto dos toasts
  beforeEach(() => {
    jest.useRealTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('adiciona e remove toast manualmente', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    const user = await userEvent.setup();
    await user.click(screen.getByText('Add Toast'));
    expect(screen.getByTestId('toast')).toHaveTextContent('Mensagem padrão');
    // Remove toast manualmente
    await act(async () => {
      screen.getByTestId('toast').click();
    });
    // aguarda DOM update
    await new Promise(r => setTimeout(r, 10));
    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });

  it('remove toast automaticamente após o tempo', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    const user = await userEvent.setup();
    await user.click(screen.getByText('Add Toast'));
    expect(screen.getByTestId('toast')).toBeInTheDocument();
    // Aguarda tempo de exibição do toast (default pode ser 4000ms)
    await act(async () => {
      await new Promise(r => setTimeout(r, 4100));
    });
    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });

  it('usa funções de conveniência para tipos de toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    const user = await userEvent.setup();
    await user.click(screen.getByText('Show Success'));
    expect(screen.getByTestId('toast')).toHaveTextContent('Sucesso!');
    await user.click(screen.getByText('Show Error'));
    expect(screen.getAllByTestId('toast')[1]).toHaveTextContent('Erro!');
    await user.click(screen.getByText('Show Warning'));
    expect(screen.getAllByTestId('toast')[2]).toHaveTextContent('Aviso!');
    await user.click(screen.getByText('Show Info'));
    expect(screen.getAllByTestId('toast')[3]).toHaveTextContent('Info!');
    // Aguarda tempo de exibição dos toasts
    await act(async () => {
      await new Promise(r => setTimeout(r, 3100));
    });
  });

  it('limpa todos os toasts com clearToasts', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    const user = await userEvent.setup();
    await user.click(screen.getByText('Add Toast'));
    await user.click(screen.getByText('Show Success'));
    expect(screen.getAllByTestId('toast').length).toBe(2);
    await user.click(screen.getByText('Clear Toasts'));
    await act(async () => {
      // Aguarda DOM update
      await new Promise(r => setTimeout(r, 10));
    });
    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });

  it('lança erro se useToast for usado fora do provider', () => {
    function BadComponent() {
      useToast();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow(
      'useToast deve ser usado dentro de ToastProvider',
    );
  });
});
