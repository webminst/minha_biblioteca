"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
const AuditService_1 = require("../services/AuditService");
const auditUtils_1 = require("../utils/auditUtils");
const auditConfig_1 = require("../config/auditConfig");
/**
 * Middleware principal de auditoria
 * Captura todas as requisições e registra logs relevantes
 */
const auditLogger = (options = {}) => {
    const { includeBody = true, includeHeaders = true, includeQuery = true, includeParams = true, logLevel = auditConfig_1.AUDIT_CONFIG.LOGGING.level } = options;
    return (req, res, next) => {
        if (!auditConfig_1.AUDIT_CONFIG || logLevel === 'OFF') {
            return next();
        }
        req.traceId = (0, auditUtils_1.generateTraceId)();
        req.startTime = Date.now();
        res.setHeader('X-Trace-ID', req.traceId);
        const originalSend = res.send;
        const originalJson = res.json;
        let responseLogged = false;
        const logRequest = async () => {
            if (responseLogged)
                return;
            responseLogged = true;
            try {
                const logData = (0, auditUtils_1.createAuditLogStructure)(req, res, req.user, req.startTime);
                if (!includeBody)
                    delete logData.request.body;
                if (!includeHeaders)
                    delete logData.request.headers;
                if (!includeQuery)
                    delete logData.request.query;
                if (!includeParams)
                    delete logData.request.params;
                await AuditService_1.AuditService.log(logData);
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
            }
            catch (error) {
                console.error('❌ Erro no middleware de auditoria:', error);
            }
        };
        res.send = function (data) {
            res.send = originalSend;
            const result = originalSend.call(this, data);
            logRequest();
            return result;
        };
        res.json = function (data) {
            res.json = originalJson;
            const result = originalJson.call(this, data);
            logRequest();
            return result;
        };
        res.on('finish', logRequest);
        next();
    };
};
exports.auditLogger = auditLogger;
