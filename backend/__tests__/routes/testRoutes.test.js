const request = require('supertest');
const express = require('express');

// Mock do Redis e middlewares
jest.mock('../../config/redis', () => ({
    redis: {
        get: jest.fn().mockResolvedValue(null),
        keys: jest.fn().mockResolvedValue([]),
        del: jest.fn().mockResolvedValue(1)
    },
    isRedisConnected: jest.fn(() => true)
}));
jest.mock('../../middleware/rateLimiter', () => ({
    loginRateLimit: (req, res, next) => next(),
    recordAttemptMiddleware: () => (req, res, next) => next()
}));

const testRoutes = require('../../routes/testRoutes');

describe('Test Routes', () => {
    let app;
    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/test', testRoutes);
    });

    it('POST /test/simulate-login deve simular login e retornar erro de credenciais', async () => {
        const res = await request(app)
            .post('/test/simulate-login')
            .send({ username: 'user', password: 'wrong' });
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', 'Credenciais inválidas (simulação)');
    });

    it('DELETE /test/reset-rate-limit deve resetar o rate limit', async () => {
        const res = await request(app)
            .delete('/test/reset-rate-limit')
            .send({ ip: '203.0.113.1' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });

    it('GET /test/check-attempts deve retornar tentativas do IP', async () => {
        const res = await request(app)
            .get('/test/check-attempts?ip=203.0.113.1');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('ip', '203.0.113.1');
    });
});
