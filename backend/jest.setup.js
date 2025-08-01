// backend/jest.setup.js
// Configuração global para testes

// Mock global para timers para evitar handles abertos
beforeAll(() => {
  // Mock de timers
  jest.spyOn(global, 'setTimeout').mockImplementation((fn, t) => {
    return 0;
  });
  jest.spyOn(global, 'setInterval').mockImplementation((fn, t) => {
    return 0;
  });
  jest.spyOn(global, 'clearTimeout').mockImplementation((id) => { });
  jest.spyOn(global, 'clearInterval').mockImplementation((id) => { });

  // Mock do Redis
  jest.mock('ioredis', () => {
    const Redis = jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      keys: jest.fn().mockResolvedValue([]),
      exists: jest.fn().mockResolvedValue(0),
      expire: jest.fn().mockResolvedValue(1),
      on: jest.fn(),
      off: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
      ping: jest.fn().mockResolvedValue('PONG'),
      select: jest.fn().mockResolvedValue('OK'),
      flushdb: jest.fn().mockResolvedValue('OK'),
      flushall: jest.fn().mockResolvedValue('OK')
    }));
    return Redis;
  });

  // Mock do CacheService
  jest.mock('./services/CacheService', () => ({
    redis: {
      connect: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      keys: jest.fn().mockResolvedValue([]),
      exists: jest.fn().mockResolvedValue(0),
      expire: jest.fn().mockResolvedValue(1),
      on: jest.fn(),
      off: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
      ping: jest.fn().mockResolvedValue('PONG'),
      select: jest.fn().mockResolvedValue('OK'),
      flushdb: jest.fn().mockResolvedValue('OK'),
      flushall: jest.fn().mockResolvedValue('OK')
    },
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    clear: jest.fn().mockResolvedValue('OK'),
    getOrSet: jest.fn().mockImplementation(async (key, fn, ttl) => {
      const result = await fn();
      return result;
    }),
    getTTLForType: jest.fn().mockReturnValue(300),
    invalidatePattern: jest.fn().mockResolvedValue('OK'),
    getStatus: jest.fn().mockResolvedValue({
      connected: true,
      keys: 0,
      memory: { used: 0, peak: 0 }
    })
  }));

  // Mock do CachedSermonService
  jest.mock('./services/CachedSermonService', () => ({
    getCacheStatus: jest.fn().mockResolvedValue({
      service: 'SermonService',
      totalKeys: 0,
      patterns: ['sermon:*'],
      sampleKeys: []
    })
  }));

  // Mock do Mongoose
  jest.mock('mongoose', () => ({
    connect: jest.fn().mockResolvedValue({}),
    disconnect: jest.fn().mockResolvedValue({}),
    connection: {
      readyState: 0,
      on: jest.fn(),
      once: jest.fn()
    },
    Schema: jest.fn().mockImplementation(() => ({
      index: jest.fn().mockReturnThis(),
      pre: jest.fn().mockReturnThis(),
      post: jest.fn().mockReturnThis(),
      virtual: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis()
    })),
    model: jest.fn().mockImplementation((name, schema) => {
      const mockModel = {
        find: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                skip: jest.fn().mockResolvedValue([])
              })
            })
          })
        }),
        findById: jest.fn().mockResolvedValue(null),
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        countDocuments: jest.fn().mockResolvedValue(0),
        aggregate: jest.fn().mockResolvedValue([])
      };
      return mockModel;
    })
  }));

  // Mock do JWT
  jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn().mockReturnValue({ userId: 'mock-user-id' }),
    decode: jest.fn().mockReturnValue({ userId: 'mock-user-id' })
  }));

  // Mock do bcrypt
  jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn().mockResolvedValue(true),
    genSalt: jest.fn().mockResolvedValue('salt')
  }));

  // Mock do speakeasy
  jest.mock('speakeasy', () => ({
    generateSecret: jest.fn().mockReturnValue({
      base32: 'mock-secret',
      otpauth_url: 'mock-url'
    }),
    verifyToken: jest.fn().mockReturnValue(true),
    generateTOTP: jest.fn().mockReturnValue('123456')
  }));

  // Mock do qrcode
  jest.mock('qrcode', () => ({
    toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock-qr-code')
  }));

  // Mock do sanitize-html
  jest.mock('sanitize-html', () => jest.fn((input) => input));

  // Mock do axios
  jest.mock('axios', () => ({
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} })
  }));
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
      if (global.__REDIS_CLIENTS__) {
        for (const client of global.__REDIS_CLIENTS__) {
          await client.disconnect();
        }
      }
    }
  } catch (e) { /* ignore */ }
});
