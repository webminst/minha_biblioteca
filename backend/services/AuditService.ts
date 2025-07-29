import { redis, isRedisConnected } from '../config/redis';
import { AUDIT_CONFIG } from '../config/auditConfig';
import {
    generateTraceId,
    validateAuditLog,
    shouldLog,
    formatTimestamp
} from '../utils/auditUtils';

class LogBuffer {
    buffer: any[] = [];
    flushInterval: NodeJS.Timeout | null = null;
    maxSize: number = AUDIT_CONFIG.STORAGE.redis.batchSize;
    flushTime: number = AUDIT_CONFIG.PERFORMANCE.batchInterval;
    constructor() {
        this.startFlushTimer();
    }
    add(logData: any) {
        this.buffer.push(logData);
        if (this.buffer.length >= this.maxSize) {
            this.flush();
        }
    }
    async flush() {
        if (this.buffer.length === 0) return;
        const logsToFlush = [...this.buffer];
        this.buffer = [];
        try {
            await AuditService.saveBatch(logsToFlush);
        } catch (error) {
            console.error('❌ Erro ao fazer flush do buffer de auditoria:', error);
            for (const log of logsToFlush) {
                try {
                    await AuditService.save(log);
                } catch (individualError) {
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
    // ...implementar métodos principais conforme necessário...
}

export const LogBufferInstance = new LogBuffer();
export const AuditService = new AuditServiceClass();
