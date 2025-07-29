"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
// Mocka CacheService.redis.keys para evitar erro de undefined
const CacheService_1 = __importDefault(require("../services/CacheService"));
const cacheServiceAny = CacheService_1.default;
if (!cacheServiceAny.redis) {
    cacheServiceAny.redis = {};
}
cacheServiceAny.redis.keys = jest.fn().mockResolvedValue([]);
// Mocka getCacheStatus dos serviços de cache usados pelo endpoint
jest.mock('../services/CachedBookService', () => ({
    getCacheStatus: jest.fn().mockResolvedValue({ service: 'BookService', totalKeys: 0, patterns: [], sampleKeys: [] })
}));
jest.mock('../services/CachedSermonService', () => ({
    getCacheStatus: jest.fn().mockResolvedValue({ service: 'SermonService', totalKeys: 0, patterns: [], sampleKeys: [] })
}));
jest.mock('../services/CachedStudyService', () => ({
    getCacheStatus: jest.fn().mockResolvedValue({ service: 'StudyService', totalKeys: 0, patterns: [], sampleKeys: [] })
}));
// Importa o app só depois do mock
// @ts-ignore
const server_1 = __importDefault(require("../server"));
describe('Health Check Endpoints', () => {
    it('GET /health deve retornar status ok e serviços conectados', async () => {
        const res = await (0, supertest_1.default)(server_1.default).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('services');
        expect(res.body.services).toHaveProperty('mongodb');
        expect(res.body.services).toHaveProperty('redis');
        expect(['connected', 'disconnected']).toContain(res.body.services.mongodb);
        // Em ambiente de teste, apenas verifica que a chave existe
        expect(res.body.services.redis).toBeDefined();
        expect(res.body).toHaveProperty('version');
    });
    it('GET /cache-status deve retornar status ok e status dos caches', async () => {
        const res = await (0, supertest_1.default)(server_1.default).get('/cache-status');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('caches');
        expect(res.body.caches).toHaveProperty('books');
        expect(res.body.caches).toHaveProperty('sermons');
        expect(res.body.caches).toHaveProperty('studies');
        expect(res.body).toHaveProperty('redis');
        // Em ambiente de teste, apenas verifica que a chave existe
        expect(res.body.redis).toBeDefined();
    });
});
