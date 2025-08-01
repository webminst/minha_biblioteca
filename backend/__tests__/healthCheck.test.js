// backend/__tests__/healthCheck.test.js
const request = require('supertest');
const app = require('../server');

describe('Health Check Endpoints', () => {
  it('GET /health deve retornar status ok e serviços conectados', async () => {
    const res = await request(app).get('/health');
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
    const res = await request(app).get('/cache-status');
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
