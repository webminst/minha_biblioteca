const cacheService = require('../../services/CacheService');
const { cacheMiddleware } = require('../../middleware/cacheMiddleware');

describe('cacheMiddleware', () => {
    let req, res, next;
    beforeEach(() => {
        req = {
            method: 'GET',
            originalUrl: '/api/test',
            query: {},
            headers: {},
            get: jest.fn((header) => req.headers[header.toLowerCase()]),
        };
        res = {
            set: jest.fn(),
            json: jest.fn(function (d) { return d; }),
            send: jest.fn(function (d) { return d; }),
            statusCode: 200
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should call next if skipCache is true', async () => {
        await cacheMiddleware({ skipCache: true })(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should call next if method is not GET', async () => {
        req.method = 'POST';
        await cacheMiddleware()(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should call next if req.query.nocache is true', async () => {
        req.query.nocache = 'true';
        await cacheMiddleware()(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should return cached data if cache hit', async () => {
        jest.spyOn(cacheService, 'get').mockResolvedValue({ foo: 'bar' });
        await cacheMiddleware()(req, res, next);
        expect(res.set).toHaveBeenCalledWith('X-Cache', 'HIT');
        expect(res.json).toHaveBeenCalledWith({ foo: 'bar' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should set cache and call next if cache miss', async () => {
        jest.spyOn(cacheService, 'get').mockResolvedValue(null);
        jest.spyOn(cacheService, 'set').mockResolvedValue();
        jest.spyOn(cacheService, 'getTTLForType').mockReturnValue(300);
        const mw = cacheMiddleware();
        await mw(req, res, next);
        // Simula resposta
        res.json({ foo: 'bar' });
        expect(res.set).toHaveBeenCalledWith('X-Cache', 'MISS');
        expect(res.set).toHaveBeenCalledWith('X-Cache-Key', expect.any(String));
        expect(cacheService.set).toHaveBeenCalledWith(expect.any(String), { foo: 'bar' }, 300);
        expect(next).toHaveBeenCalled();
    });

    it('should handle errors and call next', async () => {
        jest.spyOn(cacheService, 'get').mockRejectedValue(new Error('fail'));
        await cacheMiddleware()(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
