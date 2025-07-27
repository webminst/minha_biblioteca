const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');
const crypto = require('crypto');
const {
    generateSecureToken,
    verifySecureToken,
    applySecurityHeaders,
    authRateLimit,
    validateJWTConfig,
    JWT_CONFIG
} = require('../../middleware/jwtSecurity');

describe('jwtSecurity middlewares', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'a'.repeat(64);
        process.env.NODE_ENV = 'test';
    });

    it('generateSecureToken calls jwt.sign with correct params', () => {
        const payload = { id: 'user1' };
        jwt.sign.mockReturnValue('token');
        const token = generateSecureToken(payload, 'access');
        expect(jwt.sign).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'user1', iss: JWT_CONFIG.ISSUER, aud: JWT_CONFIG.AUDIENCE, type: 'access' }),
            process.env.JWT_SECRET,
            expect.objectContaining({ expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY, algorithm: JWT_CONFIG.ALGORITHM })
        );
        expect(token).toBe('token');
    });

    it('verifySecureToken calls jwt.verify and checks type', () => {
        jwt.verify.mockReturnValue({ id: 'user1', type: 'access' });
        const decoded = verifySecureToken('tok', 'access');
        expect(jwt.verify).toHaveBeenCalledWith(
            'tok',
            process.env.JWT_SECRET,
            expect.objectContaining({ algorithms: [JWT_CONFIG.ALGORITHM], issuer: JWT_CONFIG.ISSUER, audience: JWT_CONFIG.AUDIENCE })
        );
        expect(decoded).toEqual({ id: 'user1', type: 'access' });
    });

    it('verifySecureToken throws if type mismatch', () => {
        jwt.verify.mockReturnValue({ id: 'user1', type: 'refresh' });
        expect(() => verifySecureToken('tok', 'access')).toThrow(/Tipo de token inválido/);
    });

    it('applySecurityHeaders sets headers and calls next', () => {
        const req = {};
        const res = { setHeader: jest.fn() };
        const next = jest.fn();
        applySecurityHeaders(req, res, next);
        Object.entries(JWT_CONFIG.SECURITY_HEADERS).forEach(([header, value]) => {
            expect(res.setHeader).toHaveBeenCalledWith(header, value);
        });
        expect(next).toHaveBeenCalled();
    });

    it('authRateLimit calls next and logs warning', () => {
        const req = {}, res = {};
        const next = jest.fn();
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        authRateLimit(req, res, next);
        expect(next).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('validateJWTConfig returns valid true for strong secret', () => {
        process.env.JWT_SECRET = 'a'.repeat(64);
        const result = validateJWTConfig();
        expect(result.valid).toBe(true);
        expect(result.issues.length).toBe(0);
    });

    it('validateJWTConfig returns valid false for missing secret', () => {
        delete process.env.JWT_SECRET;
        const result = validateJWTConfig();
        expect(result.valid).toBe(false);
        expect(result.issues[0]).toMatch(/não configurado/);
    });
});
