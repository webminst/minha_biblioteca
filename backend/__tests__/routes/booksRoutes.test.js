// Força uso do mock global de AuditService definido em __mocks__
jest.mock('../../services/AuditService');
// Mock CachedBookService and cache middlewares to avoid real Redis/MongoDB
jest.mock('../../services/CachedBookService', () => ({
    getStats: jest.fn().mockResolvedValue({
        totalBooks: 42,
        totalAuthors: 10,
        totalAreas: 5,
    }),
    findAll: jest.fn().mockResolvedValue({
        books: [
            {
                _id: '1',
                title: 'Livro Teste',
                author: 'Autor Exemplo',
                area: 'Teologia',
                year: 2020
            },
            {
                _id: '2',
                title: 'Outro Livro',
                author: 'Outro Autor',
                area: 'História',
                year: 2021
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
            suggestions: () => noOp(),
            // Adicione outras estratégias aqui se necessário
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

    it('GET /api/books deve retornar lista de livros', async () => {
        const res = await request(app).get('/api/books');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(2);
        expect(res.body.data[0]).toMatchObject({
            title: 'Livro Teste',
            author: 'Autor Exemplo',
            area: 'Teologia',
            year: 2020
        });
    });
});
