// backend/jest.setup.js
// Mock global para timers para evitar handles abertos
beforeAll(() => {
    jest.spyOn(global, 'setTimeout').mockImplementation((fn, t) => {
        // Não agenda nada
        return 0;
    });
    jest.spyOn(global, 'setInterval').mockImplementation((fn, t) => {
        // Não agenda nada
        return 0;
    });
    jest.spyOn(global, 'clearTimeout').mockImplementation((id) => { });
    jest.spyOn(global, 'clearInterval').mockImplementation((id) => { });
});
afterAll(async () => {
    jest.restoreAllMocks();
    // Fecha conexão do Mongoose, se aberta
    try {
        const mongoose = require('mongoose');
        if (mongoose.connection && mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    } catch (e) { /* ignore */ }
    // Fecha conexão do Redis, se aberta
    try {
        const redis = require('ioredis');
        if (redis && redis.prototype && redis.prototype.disconnect) {
            // Força disconnect em todos os clientes criados
            if (global.__REDIS_CLIENTS__) {
                for (const client of global.__REDIS_CLIENTS__) {
                    await client.disconnect();
                }
            }
        }
    } catch (e) { /* ignore */ }
});
