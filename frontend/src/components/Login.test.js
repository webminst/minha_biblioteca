// Mock axios ANTES de qualquer import para evitar erro ESM
jest.mock('axios', () => ({
  post: jest.fn(),
  create: () => ({
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  }),
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
}));

import '@testing-library/jest-dom';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
jest.mock('../hooks/useAuth');
const mockLogin = jest.fn();
require('../hooks/useAuth').default = () => ({
  login: mockLogin,
  isLoading: false,
});
import Login from './Login';

describe('Login component', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('renderiza campos de usuário e senha', () => {
    render(<Login />, { wrapper: MemoryRouter });
    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('exibe erro se campos estiverem vazios', async () => {
    render(<Login />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(
      await screen.findByText(/preencha todos os campos/i),
    ).toBeInTheDocument();
  });

  it('chama login com usuário e senha', async () => {
    mockLogin.mockResolvedValue({ username: 'user', role: 'admin' });
    render(<Login onLoginSuccess={jest.fn()} />, { wrapper: MemoryRouter });
    fireEvent.change(screen.getByLabelText(/usuário/i), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('user', 'pass'));
  });

  it('exibe mensagem de erro se login falhar', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: 'Falha no login' } },
    });
    render(<Login />, { wrapper: MemoryRouter });
    fireEvent.change(screen.getByLabelText(/usuário/i), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText(/falha no login/i)).toBeInTheDocument();
  });
});
