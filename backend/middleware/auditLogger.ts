import { AuditService } from '../services/AuditService';
import { createAuditLogStructure, generateTraceId } from '../utils/auditUtils';
import { AUDIT_CONFIG } from '../config/auditConfig';
import { Request, Response, NextFunction } from 'express';

interface AuditLoggerOptions {
    includeBody?: boolean;
    includeHeaders?: boolean;
    includeQuery?: boolean;
    includeParams?: boolean;
    logLevel?: string;
}

/**
 * Middleware principal de auditoria
 * Captura todas as requisições e registra logs relevantes
 */
export const auditLogger = (options: AuditLoggerOptions = {}) => {
    const {
        includeBody = true,
        includeHeaders = true,
        includeQuery = true,
        includeParams = true,
        logLevel = AUDIT_CONFIG.LOGGING.level
    } = options;

    return (req: Request & { traceId?: string; startTime?: number; user?: any }, res: Response, next: NextFunction) => {
        if (!AUDIT_CONFIG || logLevel === 'OFF') {
            return next();
        }
        req.traceId = generateTraceId();
        req.startTime = Date.now();
        res.setHeader('X-Trace-ID', req.traceId);
        const originalSend = res.send;
        const originalJson = res.json;
        let responseLogged = false;
        const logRequest = async () => {
            if (responseLogged) return;
            responseLogged = true;
            try {
                const logData = createAuditLogStructure(req, res, req.user, req.startTime);
                if (!includeBody) delete logData.request.body;
                if (!includeHeaders) delete logData.request.headers;
                if (!includeQuery) delete logData.request.query;
                if (!includeParams) delete logData.request.params;
                await AuditService.log(logData);
                if (logLevel === 'DEBUG') {
                    console.log('🔍 Audit Log:', {
                        traceId: logData.traceId,
                        action: logData.action.type,
                        resource: logData.action.resource,
                        user: logData.user?.username,
                        status: logData.response.status,
                        duration: logData.metadata.duration
                    });
                }
            } catch (error) {
                console.error('❌ Erro no middleware de auditoria:', error);
            }
        };
        res.send = function (data: any) {
            res.send = originalSend;
            const result = originalSend.call(this, data);
            logRequest();
            return result;
        };
        res.json = function (data: any) {
            res.json = originalJson;
            const result = originalJson.call(this, data);
            logRequest();
            return result;
        };
        res.on('finish', logRequest);
        next();
    };
};
