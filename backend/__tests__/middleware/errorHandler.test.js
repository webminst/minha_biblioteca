const { AppError, globalErrorHandler, notFound, catchAsync, requestLogger } = require('../../middleware/errorHandler');

describe('errorHandler middlewares', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.on = jest.fn();
        return res;
    };
    const mockReq = (url = '/test') => ({
        originalUrl: url,
        method: 'GET',
        ip: '1.2.3.4',
        get: jest.fn().mockReturnValue('jest-agent')
    });
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NODE_ENV = 'test';
    });

    it('AppError sets correct properties', () => {
        const err = new AppError('msg', 404);
        expect(err.message).toBe('msg');
        expect(err.statusCode).toBe(404);
        expect(err.status).toBe('fail');
        expect(err.isOperational).toBe(true);
    });

    it('notFound middleware calls next with AppError', () => {
        const req = mockReq('/notfound');
        notFound(req, {}, next);
        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    it('globalErrorHandler sends error in development', () => {
        process.env.NODE_ENV = 'development';
        const err = new AppError('dev error', 400);
        const res = mockRes();
        globalErrorHandler(err, {}, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'dev error',
            status: 'fail',
            error: err
        }));
    });

    it('globalErrorHandler sends error in production (operational)', () => {
        process.env.NODE_ENV = 'production';
        const err = new AppError('prod error', 401);
        const res = mockRes();
        globalErrorHandler(err, {}, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            status: 'fail',
            message: 'prod error'
        });
    });

    it('catchAsync passes error to next', async () => {
        const fn = jest.fn().mockRejectedValue(new Error('async error'));
        const req = mockReq();
        const res = mockRes();
        await catchAsync(fn)(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('requestLogger logs and calls next', () => {
        const req = mockReq();
        const res = mockRes();
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        requestLogger(req, res, next);
        expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
        expect(next).toHaveBeenCalled();
        logSpy.mockRestore();
    });
});
