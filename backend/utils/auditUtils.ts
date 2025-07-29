// --- Funções auxiliares migradas do antigo auditUtils.js ---
import { Request, Response } from 'express';

export const truncateObject = (obj: any, maxSize: number): any => {
    if (!obj) return obj;
    const jsonString = JSON.stringify(obj);
    if (jsonString.length <= maxSize) return obj;
    const keys = Object.keys(obj);
    const truncated: any = {};
    for (const key of keys) {
        truncated[key] = typeof obj[key] === 'object' ? '[OBJECT_TRUNCATED]' : obj[key];
        if (JSON.stringify(truncated).length >= maxSize - 50) {
            truncated['...'] = `[TRUNCATED_${keys.length - Object.keys(truncated).length + 1}_MORE_FIELDS]`;
            break;
        }
    }
    return truncated;
};

export const parseUserAgent = (userAgent: string): any => {
    if (!userAgent) return null;
    const info: any = {
        raw: truncateString(userAgent, 200),
        browser: 'unknown',
        os: 'unknown',
        mobile: false
    };
    if (userAgent.includes('Chrome')) info.browser = 'Chrome';
    else if (userAgent.includes('Firefox')) info.browser = 'Firefox';
    else if (userAgent.includes('Safari')) info.browser = 'Safari';
    else if (userAgent.includes('Edge')) info.browser = 'Edge';
    if (userAgent.includes('Windows')) info.os = 'Windows';
    else if (userAgent.includes('Mac')) info.os = 'macOS';
    else if (userAgent.includes('Linux')) info.os = 'Linux';
    else if (userAgent.includes('Android')) info.os = 'Android';
    else if (userAgent.includes('iOS')) info.os = 'iOS';
    info.mobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    return info;
};

export const determineAction = (method: string, endpoint: string, actionTypes: any): string => {
    const key = `${method}:${endpoint}`;
    if (actionTypes[key]) {
        return actionTypes[key];
    }
    for (const [pattern, action] of Object.entries(actionTypes)) {
        if (pattern.includes('*') || endpoint.includes((pattern as string).split(':')[1])) {
            return action as string;
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

export const determineResource = (endpoint: string, resourceMapping: any): string => {
    for (const [pattern, resource] of Object.entries(resourceMapping)) {
        if (endpoint.startsWith(pattern)) {
            return resource as string;
        }
    }
    const pathParts = endpoint.split('/').filter(Boolean);
    if (pathParts.length >= 2 && pathParts[0] === 'api') {
        return pathParts[1];
    }
    return 'unknown';
};

export const extractResourceId = (endpoint: string, method: string): string | null => {
    if (["PUT", "PATCH", "DELETE"].includes(method)) {
        const pathParts = endpoint.split('/').filter(Boolean);
        const lastPart = pathParts[pathParts.length - 1];
        if (/^[a-f\d]{24}$/i.test(lastPart) || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(lastPart)) {
            return lastPart;
        }
    }
    return null;
};

export const calculateDuration = (startTime: number): number => {
    return Date.now() - startTime;
};

export const formatTimestamp = (date: Date = new Date()): string => {
    return date.toISOString();
};

export const shouldLog = (method: string, endpoint: string, userAgent: string, ip: string): boolean => {
    const { excludeEndpoints, excludeUserAgents, excludeIPs } = AUDIT_CONFIG.FILTERS;
    if (excludeEndpoints.some((excluded: string) => endpoint.includes(excluded))) {
        return false;
    }
    if (userAgent && excludeUserAgents.some((excluded: string) => userAgent.includes(excluded))) {
        return false;
    }
    if (excludeIPs.includes(ip)) {
        return false;
    }
    return true;
};

export const createAuditLogStructure = (req: Request & { traceId?: string }, res: Response, user: any, startTime: number) => {
    const { ACTION_TYPES, RESOURCE_MAPPING, CRITICALITY_LEVELS } = require('../config/auditConfig');
    const method = req.method;
    const endpoint = req.originalUrl || req.url;
    const action = determineAction(method, endpoint, ACTION_TYPES);
    const resource = determineResource(endpoint, RESOURCE_MAPPING);
    const resourceId = extractResourceId(endpoint, method);
    return {
        timestamp: formatTimestamp(),
        traceId: req.traceId || generateTraceId(),
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
            ip: req.ip || (req.connection as any)?.remoteAddress,
            userAgent: parseUserAgent(req.get ? req.get('User-Agent') : ''),
            headers: sanitizeObject(truncateObject(req.headers, AUDIT_CONFIG.LOGGING.maxHeaderSize)),
            body: req.body ? sanitizeObject(truncateObject(req.body, AUDIT_CONFIG.LOGGING.maxBodySize)) : undefined,
            query: req.query ? sanitizeObject(truncateObject(req.query, AUDIT_CONFIG.LOGGING.maxQuerySize)) : undefined,
            params: req.params ? sanitizeObject(truncateObject(req.params, AUDIT_CONFIG.LOGGING.maxParamSize)) : undefined
        },
        response: {
            status: res.statusCode,
            headers: sanitizeObject(truncateObject(res.getHeaders ? res.getHeaders() : {}, AUDIT_CONFIG.LOGGING.maxHeaderSize)),
        },
        metadata: {
            duration: startTime ? calculateDuration(startTime) : undefined
        }
    };
};
/**
 * Utilitários para o Sistema de Auditoria
 * Funções auxiliares para logging, sanitização e formatação
 */

import crypto from 'crypto';
import { AUDIT_CONFIG } from '../config/auditConfig';

/**
 * Gera um ID único para rastreamento de requisições
 */
export const generateTraceId = (): string => {
    return crypto.randomUUID();
};

/**
 * Gera hash para dados sensíveis
 */
export const hashSensitiveData = (data: unknown): string | null => {
    if (!data) return null;
    return crypto.createHash('sha256').update(String(data)).digest('hex').substring(0, 16);
};

/**
 * Sanitiza objeto removendo campos sensíveis
 */
export const sanitizeObject = (
    obj: any,
    sensitiveFields: string[] = AUDIT_CONFIG.LOGGING.sensitiveFields
): any => {
    if (!obj || typeof obj !== 'object') return obj;

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
            sanitized[key] = sanitizeObject(sanitized[key], sensitiveFields);
        }
    });

    return sanitized;
};

/**
 * Trunca string se exceder tamanho máximo
 */
export const truncateString = (str: string, maxLength: number): string => {
    if (!str || typeof str !== 'string') return str;
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
};

/**
 * Trunca objeto JSON se exceder tamanho máximo
 */
export const truncateJson = (obj: any, maxLength: number): any => {
    try {
        const jsonString = JSON.stringify(obj);
        if (jsonString.length <= maxLength) return obj;
        return JSON.parse(jsonString.substring(0, maxLength - 3) + '...');
    } catch {
        return obj;
    }
};
