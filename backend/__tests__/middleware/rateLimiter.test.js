const { loginRateLimit, recordAttemptMiddleware, clearAttemptsMiddleware, rateLimiter } = require('../../middleware/rateLimiter');

describe('rateLimiter middlewares', () => {
    const mockReq = (ip = '1.2.3.4') => ({
        ip,
        connection: { remoteAddress: ip },
        headers: {},
        get: jest.fn(),
        path: '/test',
        body: {}
    });
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('permite acesso quando abaixo do limite', async () => {
        const req = mockReq();
        const res = mockRes();
        // Força 0 tentativas
        jest.spyOn(rateLimiter, 'getAttempts').mockResolvedValue(0);
        await loginRateLimit(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalledWith(429);
    });

    it('bloqueia acesso quando excede o limite', async () => {
        const req = mockReq();
        const res = mockRes();
        jest.spyOn(rateLimiter, 'getAttempts').mockResolvedValue(100); // simula limite excedido
        jest.spyOn(rateLimiter, 'blockIP').mockResolvedValue();
        await loginRateLimit(req, res, next);
        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('registra tentativa com recordAttemptMiddleware', async () => {
        const req = mockReq();
        const res = mockRes();
        const recordSpy = jest.spyOn(rateLimiter, 'recordAttempt').mockResolvedValue(1);
        const logSpy = jest.spyOn(rateLimiter, 'logSecurityEvent').mockResolvedValue();
        await recordAttemptMiddleware('LOGIN')(req, res, next);
        expect(recordSpy).toHaveBeenCalledWith('1.2.3.4', 'LOGIN');
        expect(logSpy).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });

    it('limpa tentativas com clearAttemptsMiddleware', async () => {
        const req = mockReq();
        const res = mockRes();
        const clearSpy = jest.spyOn(rateLimiter, 'clearAttempts').mockResolvedValue();
        await clearAttemptsMiddleware('LOGIN')(req, res, next);
        expect(clearSpy).toHaveBeenCalledWith('1.2.3.4', 'LOGIN');
        expect(next).toHaveBeenCalled();
    });
});
