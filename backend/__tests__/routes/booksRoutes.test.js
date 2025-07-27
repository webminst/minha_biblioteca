// Mock CachedBookService and cache middlewares to avoid real Redis/MongoDB
jest.mock('../../services/CachedBookService', () => ({
    getStats: jest.fn().mockResolvedValue({
        totalBooks: 42,
        totalAuthors: 10,
        totalAreas: 5,
    }),
}));
jest.mock('../../middleware/cacheMiddleware', () => {
    // List all possible strategies used in books.js
    const noOp = () => (req, res, next) => next();
    return {
        cacheStrategies: {
            stats: () => noOp(),
            contentList: () => noOp(),
            contentDetail: () => noOp(),
            home: () => noOp(),
            search: () => noOp(),
            detail: () => noOp(),
            filters: () => noOp(),
            // Add more if needed for future-proofing
        },
        cacheStatsMiddleware: () => noOp(),
        invalidateCacheMiddleware: () => noOp(),
    };
});

const request = require('supertest');
const express = require('express');
const booksRouter = require('../../routes/books');

// Cria app isolado para teste
const app = express();
app.use(express.json());
app.use('/api/books', booksRouter);

describe('Books Routes', () => {
    it('GET /api/books/count deve retornar contagem de livros', async () => {
        const res = await request(app).get('/api/books/count');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data.count', 42);
        expect(res.body).toHaveProperty('message', 'Contagem de livros obtida com sucesso');
    });
});
