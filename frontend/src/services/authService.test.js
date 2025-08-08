// Mock axios antes de importar o serviço para evitar erro ESM
jest.mock('axios', () => ({
  post: jest.fn(),
  create: () => ({
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  }),
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
}));

import authService from './authService';
import axios from 'axios';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve armazenar tokens e retornar dados do usuário em login bem-sucedido', async () => {
      axios.post.mockResolvedValue({
        data: {
          token: 'fake-token',
          refreshToken: 'fake-refresh',
          username: 'usuario',
          role: 'admin',
        },
      });
      const result = await authService.login('usuario', 'senha');
      expect(localStorage.getItem('userToken')).toBe('fake-token');
      expect(localStorage.getItem('refreshToken')).toBe('fake-refresh');
      expect(localStorage.getItem('username')).toBe('usuario');
      expect(localStorage.getItem('userRole')).toBe('admin');
      expect(result).toEqual({
        username: 'usuario',
        role: 'admin',
        token: 'fake-token',
        refreshToken: 'fake-refresh',
      });
    });

    it('deve lançar erro em login inválido', async () => {
      axios.post.mockRejectedValue(new Error('Login inválido'));
      await expect(authService.login('usuario', 'senha')).rejects.toThrow(
        'Login inválido',
      );
    });
  });

  describe('logout', () => {
    it('deve remover tokens do localStorage', () => {
      localStorage.setItem('userToken', 'token');
      localStorage.setItem('refreshToken', 'refresh');
      authService.logout();
      expect(localStorage.getItem('userToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar true se tokens existirem', () => {
      localStorage.setItem('userToken', 'token');
      localStorage.setItem('refreshToken', 'refresh');
      expect(authService.isAuthenticated()).toBe(true);
    });
    it('deve retornar false se tokens não existirem', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
