// __tests__/routes/sermonsRoutes.test.js
// Testes de integração para rotas de sermões

// Mock AuditService e LogBuffer para evitar flush/timeout real
jest.mock('../../services/AuditService');
// Mock SermonService e cache middlewares para evitar dependências externas
jest.mock('../../services/CachedSermonService', () => ({
    getStats: jest.fn().mockResolvedValue({
        totalSermons: 12,
        totalPreachers: 3,
        totalThemes: 4,
    }),
    findAll: jest.fn().mockResolvedValue({
        sermons: [
            {
                _id: '1',
                title: 'Sermão Teste',
                preacher: 'Pr. Exemplo',
                theme: 'Fé',
                year: 2022
            },
            {
                _id: '2',
                title: 'Outro Sermão',
                preacher: 'Pr. Outro',
                theme: 'Graça',
                year: 2023
            }
        ],
        pagination: {
            page: 1,
            limit: 10,
            total: 2,
            pages: 1,
            hasNext: false,
            hasPrev: false
        }
    }),
}));
jest.mock('../../middleware/cacheMiddleware', () => {
    const noOp = () => (req, res, next) => next();
    return {
        cacheMiddleware: () => noOp(),
        cacheStrategies: {
            stats: () => noOp(),
            contentList: () => noOp(),
            contentDetail: () => noOp(),
            home: () => noOp(),
            search: () => noOp(),
            detail: () => noOp(),
            filters: () => noOp(),
            suggestions: () => noOp(),
        },
        cacheStatsMiddleware: () => noOp(),
        invalidateCacheMiddleware: () => noOp(),
    };
});

const request = require('supertest');
const express = require('express');
const sermonsRouter = require('../../routes/sermons');

const app = express();
app.use(express.json());
app.use('/api/sermons', sermonsRouter);

describe('Sermons Routes', () => {
    it('GET /api/sermons/count deve retornar contagem de sermões', async () => {
        const res = await request(app).get('/api/sermons/count');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data.count', 12);
        expect(res.body).toHaveProperty('message', 'Contagem de sermões obtida com sucesso');
    });

    it('GET /api/sermons deve retornar lista de sermões', async () => {
        const res = await request(app).get('/api/sermons');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(2);
        expect(res.body.data[0]).toMatchObject({
            title: 'Sermão Teste',
            preacher: 'Pr. Exemplo',
            theme: 'Fé',
            year: 2022
        });
    });
});
