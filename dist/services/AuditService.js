"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = exports.LogBufferInstance = void 0;
const auditConfig_1 = require("../config/auditConfig");
const auditUtils_1 = require("../utils/auditUtils");
class LogBuffer {
    constructor() {
        this.buffer = [];
        this.flushInterval = null;
        this.maxSize = auditConfig_1.AUDIT_CONFIG.STORAGE.redis.batchSize;
        this.flushTime = auditConfig_1.AUDIT_CONFIG.PERFORMANCE.batchInterval;
        this.startFlushTimer();
    }
    add(logData) {
        this.buffer.push(logData);
        if (this.buffer.length >= this.maxSize) {
            this.flush();
        }
    }
    async flush() {
        if (this.buffer.length === 0)
            return;
        const logsToFlush = [...this.buffer];
        this.buffer = [];
        try {
            await exports.AuditService.saveBatch(logsToFlush);
        }
        catch (error) {
            console.error('❌ Erro ao fazer flush do buffer de auditoria:', error);
            for (const log of logsToFlush) {
                try {
                    await exports.AuditService.save(log);
                }
                catch (individualError) {
                    console.error('❌ Erro ao salvar log individual:', individualError);
                }
            }
        }
    }
    startFlushTimer() {
        this.flushInterval = setInterval(() => {
            this.flush();
        }, this.flushTime);
    }
}
class AuditServiceClass {
    async log(logData) {
        // Validação e lógica simplificada para TypeScript
        const validation = (0, auditUtils_1.validateAuditLog)(logData);
        if (!validation.isValid) {
            console.warn('⚠️ Log de auditoria inválido:', validation.errors);
            return false;
        }
        if (!(0, auditUtils_1.shouldLog)(logData.action.method, logData.action.endpoint, logData.request.userAgent?.raw, logData.request.ip)) {
            return false;
        }
        logData.metadata = logData.metadata || {};
        logData.metadata.logId = (0, auditUtils_1.generateTraceId)();
        logData.metadata.loggedAt = (0, auditUtils_1.formatTimestamp)();
        // Aqui você pode adicionar lógica de armazenamento (Redis/MongoDB/etc)
        // Exemplo: await redis.set(...)
        // Por enquanto, apenas imprime no console
        console.log('📝 Audit log registrado:', logData);
        return true;
    }
}
exports.LogBufferInstance = new LogBuffer();
exports.AuditService = new AuditServiceClass();
