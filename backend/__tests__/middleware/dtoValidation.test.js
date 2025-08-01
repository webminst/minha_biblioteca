const { validateInput, transformOutput, validateAndTransform, validateSearch, validateId, successResponse, handleValidationErrors } = require('../../middleware/dtoValidation');
const { ApiResponseDTO } = require('../../dto');

describe('dtoValidation middlewares', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  let next;

  class DummyDTO {
    static validateAndCreate(data) {
      if (data && data.valid) {
        return { success: true, data: { ...data, extra: true }, instance: new DummyDTO() };
      } else {
        return { success: false, errors: [{ field: 'valid', message: 'Invalid' }] };
      }
    }
    constructor() { }
    toPublicObject() { return { public: true }; }
    toSafeObject() { return { safe: true }; }
  }

  beforeEach(() => {
    next = jest.fn();
  });

  it('validateInput calls next on valid data', () => {
    const req = { body: { valid: true } };
    const res = mockRes();
    const middleware = validateInput(DummyDTO, 'body');
    middleware(req, res, next);
    expect(req.validatedData).toEqual({ valid: true, extra: true });
    expect(next).toHaveBeenCalled();
  });

  it('validateInput returns 400 on invalid data', () => {
    const req = { body: { valid: false } };
    const res = mockRes();
    const middleware = validateInput(DummyDTO, 'body');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  it('transformOutput transforms array data', () => {
    const req = {};
    const res = mockRes();
    const data = { data: [{}, {}] };
    const middleware = transformOutput(DummyDTO, 'toPublicObject');
    res.json = jest.fn(function (d) { return d; });
    middleware(req, res, next);
    const result = res.json(data);
    expect(result.data[0]).toHaveProperty('public', true);
    expect(next).toHaveBeenCalled();
  });

  it('validateId calls next on valid id', () => {
    const req = { params: { id: '507f1f77bcf86cd799439011' } };
    const res = mockRes();
    const nextFn = jest.fn();
    // Mock MongoIdDTO.validate
    jest.mock('../../dto', () => ({
      ...jest.requireActual('../../dto'),
      MongoIdDTO: { validate: jest.fn() },
    }));
    require('../../dto').MongoIdDTO.validate.mockImplementation(() => true);
    validateId(req, res, nextFn);
    expect(nextFn).toHaveBeenCalled();
  });

  it('validateId returns 400 on invalid id', () => {
    const req = { params: { id: 'invalid' } };
    const res = mockRes();
    const nextFn = jest.fn();
    jest.mock('../../dto', () => ({
      ...jest.requireActual('../../dto'),
      MongoIdDTO: { validate: jest.fn(() => { throw new Error('bad id'); }) },
    }));
    require('../../dto').MongoIdDTO.validate.mockImplementation(() => { throw new Error('bad id'); });
    validateId(req, res, nextFn);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(nextFn).not.toHaveBeenCalled();
  });

  it('successResponse wraps data in ApiResponseDTO', () => {
    const req = {};
    const res = mockRes();
    const middleware = successResponse('ok', 201);
    res.json = jest.fn(function (d) { return d; });
    middleware(req, res, next);
    const result = res.json({ foo: 'bar' });
    expect(result.success).toBe(true);
    expect(result.message).toBe('ok');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(next).toHaveBeenCalled();
  });

  it('handleValidationErrors handles Joi error', () => {
    const error = { isJoi: true, details: [{ path: ['field'], message: 'msg', context: { value: 1 } }] };
    const req = {}, res = mockRes();
    handleValidationErrors(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('handleValidationErrors passes unknown error to next', () => {
    const error = new Error('other');
    const req = {}, res = mockRes();
    handleValidationErrors(error, req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
