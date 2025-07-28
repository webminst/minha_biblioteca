// Mock manual para authService.js para evitar importação real do axios (ESM)
module.exports = {
    getAccessToken: jest.fn(),
    refreshToken: jest.fn(),
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
};
