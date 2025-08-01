const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');
const User = require('../../models/User');
jest.mock('../../models/User');
const { verifySecureToken } = require('../../middleware/jwtSecurity');
jest.mock('../../middleware/jwtSecurity');
const { protect } = require('../../middleware/authMiddleware');

// Mock response helpers
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware - protect', () => {
  afterEach(() => jest.clearAllMocks());

  it('permite acesso com token válido e usuário existente', async () => {
    const req = {
      headers: { authorization: 'Bearer validtoken' },
    };
    const user = { _id: 'id123', username: 'user', role: 'admin' };
    verifySecureToken.mockReturnValue({ id: 'id123', role: 'admin' });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });
    const res = mockRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalled();
  });

  it('retorna 401 se token ausente', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 se usuário não encontrado', async () => {
    const req = { headers: { authorization: 'Bearer validtoken' } };
    verifySecureToken.mockReturnValue({ id: 'id123', role: 'admin' });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });
    const res = mockRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 se token inválido', async () => {
    const req = { headers: { authorization: 'Bearer invalidtoken' } };
    verifySecureToken.mockImplementation(() => { throw new Error('Token inválido'); });
    const res = mockRes();
    const next = jest.fn();
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
