// Força uso do mock global de AuditService definido em __mocks__
jest.mock('../../services/AuditService');
const { auditLogger, auditAdminActions, auditAuthActions, auditCriticalActions, auditUserContext, auditErrorLogger, auditStatsCollector, createCustomAuditLogger } = require('../../middleware/auditLogger');

describe('auditLogger middlewares', () => {
    let req, res, next;
    beforeEach(() => {
        req = {
            headers: {},
            user: { _id: 'id', username: 'user', role: 'admin' },
            method: 'GET',
            originalUrl: '/test',
            ip: '1.2.3.4',
            get: jest.fn((header) => {
                // Simula o método req.get do Express
                if (header && req.headers) {
                    return req.headers[header.toLowerCase()];
                }
                return undefined;
            })
        };
        res = {
            setHeader: jest.fn(),
            on: jest.fn((event, cb) => { if (event === 'finish') cb(); }),
            send: jest.fn(function (d) { return d; }),
            json: jest.fn(function (d) { return d; }),
            statusCode: 200
        };
        next = jest.fn();
    });

    it('auditLogger sets X-Trace-ID and calls next', () => {
        auditLogger()(req, res, next);
        expect(res.setHeader).toHaveBeenCalledWith('X-Trace-ID', expect.any(String));
        expect(next).toHaveBeenCalled();
    });

    it('auditAdminActions sets X-Trace-ID and calls next', () => {
        auditAdminActions()(req, res, next);
        expect(res.setHeader).toHaveBeenCalledWith('X-Trace-ID', expect.any(String));
        expect(next).toHaveBeenCalled();
    });

    it('auditAuthActions sets authAction and loginAttempt, and sets X-Trace-ID', () => {
        req.originalUrl = '/login';
        auditAuthActions()(req, res, next);
        expect(req.authAction).toBe(true);
        expect(req.loginAttempt).toBe(true);
        expect(res.setHeader).toHaveBeenCalledWith('X-Trace-ID', expect.any(String));
        expect(next).toHaveBeenCalled();
    });

    it('auditCriticalActions sets criticalAction and sets X-Trace-ID', () => {
        auditCriticalActions()(req, res, next);
        expect(req.criticalAction).toBe(true);
        expect(res.setHeader).toHaveBeenCalledWith('X-Trace-ID', expect.any(String));
        expect(next).toHaveBeenCalled();
    });

    it('auditUserContext adds auditContext if user exists', () => {
        auditUserContext()(req, res, next);
        expect(req.auditContext).toEqual(expect.objectContaining({ userId: 'id', username: 'user', role: 'admin' }));
        expect(next).toHaveBeenCalled();
    });

    it('auditErrorLogger logs error and calls next(error)', async () => {
        req.traceId = 'trace';
        const error = new Error('fail');
        const spy = jest.spyOn(console, 'error').mockImplementation(() => { });
        auditErrorLogger()(error, req, res, next);
        await new Promise(resolve => setImmediate(resolve));
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Error logged'), expect.any(Object));
        expect(next).toHaveBeenCalledWith(error);
        spy.mockRestore();
    });

    it('auditStatsCollector logs stats on finish', async () => {
        process.env.NODE_ENV = 'development';
        const spy = jest.spyOn(console, 'log').mockImplementation(() => { });
        auditStatsCollector()(req, res, next);
        // Simula o evento 'finish' e aguarda o ciclo de eventos
        await new Promise(resolve => setImmediate(resolve));
        expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
        expect(next).toHaveBeenCalled();
        spy.mockRestore();
    });

    it('createCustomAuditLogger returns a middleware', () => {
        const mw = createCustomAuditLogger({ logLevel: 'DEBUG' });
        expect(typeof mw).toBe('function');
    });
});
