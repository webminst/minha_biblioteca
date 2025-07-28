// __tests__/routes/studiesRoutes.test.js
// Testes de integração para rotas de estudos

jest.mock('../../services/AuditService');
jest.mock('../../services/CachedStudyService', () => ({
    getStats: jest.fn().mockResolvedValue({
        totalStudies: 7,
        totalAuthors: 2,
        totalThemes: 3,
    }),
    findAll: jest.fn().mockResolvedValue({
        studies: [
            {
                _id: '1',
                title: 'Estudo Teste',
                author: 'Autor Exemplo',
                theme: 'Esperança',
                year: 2021
            },
            {
                _id: '2',
                title: 'Outro Estudo',
                author: 'Outro Autor',
                theme: 'Perseverança',
                year: 2022
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
const studiesRouter = require('../../routes/studies');

const app = express();
app.use(express.json());
app.use('/api/studies', studiesRouter);

describe('Studies Routes', () => {
    it('GET /api/studies/count deve retornar contagem de estudos', async () => {
        const res = await request(app).get('/api/studies/count');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data.count', 7);
        expect(res.body).toHaveProperty('message', 'Contagem de estudos obtida com sucesso');
    });

    it('GET /api/studies deve retornar lista de estudos', async () => {
        const res = await request(app).get('/api/studies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(2);
        expect(res.body.data[0]).toMatchObject({
            title: 'Estudo Teste',
            author: 'Autor Exemplo',
            theme: 'Esperança',
            year: 2021
        });
    });
});
