// __tests__/routes/authRoutes.test.js
// Testes de integração para rotas de autenticação (login)

jest.mock('../../services/AuditService');
jest.mock('../../models/User', () => {
  return {
    findOne: jest.fn().mockResolvedValue({
      _id: '1',
      username: 'usuario',
      role: 'admin',
      password: 'hashed',
      twoFactorAuth: { enabled: false },
      matchPassword: jest.fn().mockResolvedValue(true),
    }),
    create: jest.fn().mockResolvedValue({
      _id: '1',
      username: 'usuario',
      role: 'admin',
      password: 'hashed',
      twoFactorAuth: { enabled: false },
    }),
    findByIdAndUpdate: jest.fn().mockResolvedValue({}),
  };
});
jest.mock('../../middleware/jwtSecurity', () => ({
  generateSecureToken: jest.fn(() => 'fake-token'),
  verifySecureToken: jest.fn(() => ({ id: '1', role: 'admin' })),
}));
jest.mock('../../services/TwoFactorService', () => ({
  verifyLogin: jest.fn().mockResolvedValue(true),
}));
jest.mock('../../middleware/cacheMiddleware', () => {
  const noOp = () => (req, res, next) => next();
  return {
    cacheMiddleware: () => noOp(),
    cacheStrategies: {},
    cacheStatsMiddleware: () => noOp(),
    invalidateCacheMiddleware: () => noOp(),
  };
});

const request = require('supertest');
const express = require('express');
const authRouter = require('../../routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Routes', () => {
  it('POST /api/auth/login deve autenticar usuário e retornar tokens', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'usuario', password: 'senha' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('username', 'usuario');
    expect(res.body).toHaveProperty('token', 'fake-token');
    expect(res.body).toHaveProperty('refreshToken', 'fake-token');
  });
});
