"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncateJson = exports.truncateString = exports.sanitizeObject = exports.hashSensitiveData = exports.generateTraceId = exports.createAuditLogStructure = exports.shouldLog = exports.formatTimestamp = exports.calculateDuration = exports.extractResourceId = exports.determineResource = exports.determineAction = exports.parseUserAgent = exports.truncateObject = void 0;
const truncateObject = (obj, maxSize) => {
    if (!obj)
        return obj;
    const jsonString = JSON.stringify(obj);
    if (jsonString.length <= maxSize)
        return obj;
    const keys = Object.keys(obj);
    const truncated = {};
    for (const key of keys) {
        truncated[key] = typeof obj[key] === 'object' ? '[OBJECT_TRUNCATED]' : obj[key];
        if (JSON.stringify(truncated).length >= maxSize - 50) {
            truncated['...'] = `[TRUNCATED_${keys.length - Object.keys(truncated).length + 1}_MORE_FIELDS]`;
            break;
        }
    }
    return truncated;
};
exports.truncateObject = truncateObject;
const parseUserAgent = (userAgent) => {
    if (!userAgent)
        return null;
    const info = {
        raw: (0, exports.truncateString)(userAgent, 200),
        browser: 'unknown',
        os: 'unknown',
        mobile: false
    };
    if (userAgent.includes('Chrome'))
        info.browser = 'Chrome';
    else if (userAgent.includes('Firefox'))
        info.browser = 'Firefox';
    else if (userAgent.includes('Safari'))
        info.browser = 'Safari';
    else if (userAgent.includes('Edge'))
        info.browser = 'Edge';
    if (userAgent.includes('Windows'))
        info.os = 'Windows';
    else if (userAgent.includes('Mac'))
        info.os = 'macOS';
    else if (userAgent.includes('Linux'))
        info.os = 'Linux';
    else if (userAgent.includes('Android'))
        info.os = 'Android';
    else if (userAgent.includes('iOS'))
        info.os = 'iOS';
    info.mobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    return info;
};
exports.parseUserAgent = parseUserAgent;
const determineAction = (method, endpoint, actionTypes) => {
    const key = `${method}:${endpoint}`;
    if (actionTypes[key]) {
        return actionTypes[key];
    }
    for (const [pattern, action] of Object.entries(actionTypes)) {
        if (pattern.includes('*') || endpoint.includes(pattern.split(':')[1])) {
            return action;
        }
    }
    switch (method) {
        case 'POST': return 'CREATE';
        case 'PUT':
        case 'PATCH': return 'UPDATE';
        case 'DELETE': return 'DELETE';
        default: return 'READ';
    }
};
exports.determineAction = determineAction;
const determineResource = (endpoint, resourceMapping) => {
    for (const [pattern, resource] of Object.entries(resourceMapping)) {
        if (endpoint.startsWith(pattern)) {
            return resource;
        }
    }
    const pathParts = endpoint.split('/').filter(Boolean);
    if (pathParts.length >= 2 && pathParts[0] === 'api') {
        return pathParts[1];
    }
    return 'unknown';
};
exports.determineResource = determineResource;
const extractResourceId = (endpoint, method) => {
    if (["PUT", "PATCH", "DELETE"].includes(method)) {
        const pathParts = endpoint.split('/').filter(Boolean);
        const lastPart = pathParts[pathParts.length - 1];
        if (/^[a-f\d]{24}$/i.test(lastPart) || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(lastPart)) {
            return lastPart;
        }
    }
    return null;
};
exports.extractResourceId = extractResourceId;
const calculateDuration = (startTime) => {
    return Date.now() - startTime;
};
exports.calculateDuration = calculateDuration;
const formatTimestamp = (date = new Date()) => {
    return date.toISOString();
};
exports.formatTimestamp = formatTimestamp;
const shouldLog = (method, endpoint, userAgent, ip) => {
    const { excludeEndpoints, excludeUserAgents, excludeIPs } = auditConfig_1.AUDIT_CONFIG.FILTERS;
    if (excludeEndpoints.some((excluded) => endpoint.includes(excluded))) {
        return false;
    }
    if (userAgent && excludeUserAgents.some((excluded) => userAgent.includes(excluded))) {
        return false;
    }
    if (excludeIPs.includes(ip)) {
        return false;
    }
    return true;
};
exports.shouldLog = shouldLog;
const createAuditLogStructure = (req, res, user, startTime) => {
    const { ACTION_TYPES, RESOURCE_MAPPING, CRITICALITY_LEVELS } = require('../config/auditConfig');
    const method = req.method;
    const endpoint = req.originalUrl || req.url;
    const action = (0, exports.determineAction)(method, endpoint, ACTION_TYPES);
    const resource = (0, exports.determineResource)(endpoint, RESOURCE_MAPPING);
    const resourceId = (0, exports.extractResourceId)(endpoint, method);
    return {
        timestamp: (0, exports.formatTimestamp)(),
        traceId: req.traceId || (0, exports.generateTraceId)(),
        user: user ? {
            id: user._id || user.id,
            username: user.username,
            role: user.role
        } : null,
        action: {
            type: action,
            resource: resource,
            resourceId: resourceId,
            endpoint: endpoint,
            method: method,
            criticality: CRITICALITY_LEVELS[action] || 'normal'
        },
        request: {
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: (0, exports.parseUserAgent)(req.get ? req.get('User-Agent') : ''),
            headers: (0, exports.sanitizeObject)((0, exports.truncateObject)(req.headers, auditConfig_1.AUDIT_CONFIG.LOGGING.maxHeaderSize)),
            body: req.body ? (0, exports.sanitizeObject)((0, exports.truncateObject)(req.body, auditConfig_1.AUDIT_CONFIG.LOGGING.maxBodySize)) : undefined,
            query: req.query ? (0, exports.sanitizeObject)((0, exports.truncateObject)(req.query, auditConfig_1.AUDIT_CONFIG.LOGGING.maxQuerySize)) : undefined,
            params: req.params ? (0, exports.sanitizeObject)((0, exports.truncateObject)(req.params, auditConfig_1.AUDIT_CONFIG.LOGGING.maxParamSize)) : undefined
        },
        response: {
            status: res.statusCode,
            headers: (0, exports.sanitizeObject)((0, exports.truncateObject)(res.getHeaders ? res.getHeaders() : {}, auditConfig_1.AUDIT_CONFIG.LOGGING.maxHeaderSize)),
        },
        metadata: {
            duration: startTime ? (0, exports.calculateDuration)(startTime) : undefined
        }
    };
};
exports.createAuditLogStructure = createAuditLogStructure;
/**
 * Utilitários para o Sistema de Auditoria
 * Funções auxiliares para logging, sanitização e formatação
 */
const crypto_1 = __importDefault(require("crypto"));
const auditConfig_1 = require("../config/auditConfig");
/**
 * Gera um ID único para rastreamento de requisições
 */
const generateTraceId = () => {
    return crypto_1.default.randomUUID();
};
exports.generateTraceId = generateTraceId;
/**
 * Gera hash para dados sensíveis
 */
const hashSensitiveData = (data) => {
    if (!data)
        return null;
    return crypto_1.default.createHash('sha256').update(String(data)).digest('hex').substring(0, 16);
};
exports.hashSensitiveData = hashSensitiveData;
/**
 * Sanitiza objeto removendo campos sensíveis
 */
const sanitizeObject = (obj, sensitiveFields = auditConfig_1.AUDIT_CONFIG.LOGGING.sensitiveFields) => {
    if (!obj || typeof obj !== 'object')
        return obj;
    const sanitized = { ...obj };
    // Remove campos sensíveis
    sensitiveFields.forEach(field => {
        if (field in sanitized) {
            sanitized[field] = '[HIDDEN]';
        }
    });
    // Recursivo para objetos aninhados
    Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = (0, exports.sanitizeObject)(sanitized[key], sensitiveFields);
        }
    });
    return sanitized;
};
exports.sanitizeObject = sanitizeObject;
/**
 * Trunca string se exceder tamanho máximo
 */
const truncateString = (str, maxLength) => {
    if (!str || typeof str !== 'string')
        return str;
    if (str.length <= maxLength)
        return str;
    return str.substring(0, maxLength - 3) + '...';
};
exports.truncateString = truncateString;
/**
 * Trunca objeto JSON se exceder tamanho máximo
 */
const truncateJson = (obj, maxLength) => {
    try {
        const jsonString = JSON.stringify(obj);
        if (jsonString.length <= maxLength)
            return obj;
        return JSON.parse(jsonString.substring(0, maxLength - 3) + '...');
    }
    catch {
        return obj;
    }
};
exports.truncateJson = truncateJson;
