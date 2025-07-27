// __mocks__/services/AuditService.js
// Mock global para AuditService e LogBuffer


// Mock LogBuffer sem timers nem side effects
class LogBuffer {
    constructor() {
        // Garante que nenhum timer é criado
        // Se o código real tentar setTimeout/setInterval, sobrescreva globalmente
        this._timer = null;
    }
    add() { }
    flush() { }
    // Se o código tentar start/stop timer, não faz nada
    start() { }
    stop() { }
}

module.exports = {
    saveBatch: jest.fn().mockResolvedValue(undefined),
    save: jest.fn().mockResolvedValue(undefined),
    LogBuffer,
};
