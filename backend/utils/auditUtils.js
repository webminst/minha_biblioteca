// utils/auditUtils.js
/**
 * Utilitários para o Sistema de Auditoria
 * Funções auxiliares para logging, sanitização e formatação
 */

const crypto = require('crypto');
const { AUDIT_CONFIG } = require('../config/auditConfig');

/**
 * Gera um ID único para rastreamento de requisições
 */
const generateTraceId = () => {
  return crypto.randomUUID();
};

/**
 * Gera hash para dados sensíveis
 */
const hashSensitiveData = (data) => {
  if (!data) return null;
  return crypto.createHash('sha256').update(String(data)).digest('hex').substring(0, 16);
};

/**
 * Sanitiza objeto removendo campos sensíveis
 */
const sanitizeObject = (obj, sensitiveFields = AUDIT_CONFIG.LOGGING.sensitiveFields) => {
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
const truncateString = (str, maxLength) => {
  if (!str || typeof str !== 'string') return str;
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength - 3)}...`;
};

/**
 * Trunca objeto JSON se exceder tamanho máximo
 */
const truncateObject = (obj, maxSize) => {
  if (!obj) return obj;

  const jsonString = JSON.stringify(obj);
  if (jsonString.length <= maxSize) return obj;

  // Se muito grande, retorna versão simplificada
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

/**
 * Extrai informações do User-Agent
 */
const parseUserAgent = (userAgent) => {
  if (!userAgent) return null;

  // Extração básica de informações
  const info = {
    raw: truncateString(userAgent, 200),
    browser: 'unknown',
    os: 'unknown',
    mobile: false,
  };

  // Detecta navegador
  if (userAgent.includes('Chrome')) info.browser = 'Chrome';
  else if (userAgent.includes('Firefox')) info.browser = 'Firefox';
  else if (userAgent.includes('Safari')) info.browser = 'Safari';
  else if (userAgent.includes('Edge')) info.browser = 'Edge';

  // Detecta SO
  if (userAgent.includes('Windows')) info.os = 'Windows';
  else if (userAgent.includes('Mac')) info.os = 'macOS';
  else if (userAgent.includes('Linux')) info.os = 'Linux';
  else if (userAgent.includes('Android')) info.os = 'Android';
  else if (userAgent.includes('iOS')) info.os = 'iOS';

  // Detecta mobile
  info.mobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);

  return info;
};

/**
 * Determina o tipo de ação baseado no método e endpoint
 */
const determineAction = (method, endpoint, actionTypes) => {
  const key = `${method}:${endpoint}`;

  // Busca match exato primeiro
  if (actionTypes[key]) {
    return actionTypes[key];
  }

  // Busca match por padrão
  for (const [pattern, action] of Object.entries(actionTypes)) {
    if (pattern.includes('*') || endpoint.includes(pattern.split(':')[1])) {
      return action;
    }
  }

  // Fallback baseado no método HTTP
  switch (method) {
  case 'POST': return 'CREATE';
  case 'PUT':
  case 'PATCH': return 'UPDATE';
  case 'DELETE': return 'DELETE';
  default: return 'READ';
  }
};

/**
 * Determina o recurso baseado no endpoint
 */
const determineResource = (endpoint, resourceMapping) => {
  for (const [pattern, resource] of Object.entries(resourceMapping)) {
    if (endpoint.startsWith(pattern)) {
      return resource;
    }
  }

  // Extrai recurso do path
  const pathParts = endpoint.split('/').filter(Boolean);
  if (pathParts.length >= 2 && pathParts[0] === 'api') {
    return pathParts[1];
  }

  return 'unknown';
};

/**
 * Extrai ID do recurso do endpoint
 */
const extractResourceId = (endpoint, method) => {
  // Para operações de UPDATE/DELETE, geralmente o ID está no final
  if (['PUT', 'PATCH', 'DELETE'].includes(method)) {
    const pathParts = endpoint.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];

    // Verifica se é um ID válido (ObjectId do MongoDB ou UUID)
    if (/^[a-f\d]{24}$/i.test(lastPart) ||
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(lastPart)) {
      return lastPart;
    }
  }

  return null;
};

/**
 * Calcula duração de uma operação
 */
const calculateDuration = (startTime) => {
  return Date.now() - startTime;
};

/**
 * Formata timestamp para log
 */
const formatTimestamp = (date = new Date()) => {
  return date.toISOString();
};

/**
 * Verifica se deve fazer log da requisição
 */
const shouldLog = (method, endpoint, userAgent, ip) => {
  const { excludeEndpoints, excludeUserAgents, excludeIPs } = AUDIT_CONFIG.FILTERS;

  // Verifica endpoints excluídos
  if (excludeEndpoints.some(excluded => endpoint.includes(excluded))) {
    return false;
  }

  // Verifica user agents excluídos
  if (userAgent && excludeUserAgents.some(excluded => userAgent.includes(excluded))) {
    return false;
  }

  // Verifica IPs excluídos
  if (excludeIPs.includes(ip)) {
    return false;
  }

  return true;
};

/**
 * Cria estrutura básica do log de auditoria
 */
const createAuditLogStructure = (req, res, user, startTime) => {
  const {
    ACTION_TYPES,
    RESOURCE_MAPPING,
    CRITICALITY_LEVELS,
  } = require('../config/auditConfig');

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
      role: user.role,
    } : null,
    action: {
      type: action,
      resource,
      resourceId,
      endpoint,
      method,
      criticality: CRITICALITY_LEVELS[action] || 'normal',
    },
    request: {
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: parseUserAgent(req.get('User-Agent')),
      headers: sanitizeObject(
        truncateObject(req.headers, AUDIT_CONFIG.LOGGING.maxHeaderSize),
      ),
      body: req.body ? sanitizeObject(
        truncateObject(req.body, AUDIT_CONFIG.LOGGING.maxBodySize),
      ) : null,
      query: req.query || null,
      params: req.params || null,
    },
    response: {
      status: res.statusCode,
      success: res.statusCode < 400,
      message: res.locals?.message || null,
    },
    metadata: {
      duration: calculateDuration(startTime),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      server: {
        hostname: require('os').hostname(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    },
  };
};

/**
 * Valida estrutura do log de auditoria
 */
const validateAuditLog = (logData) => {
  const errors = [];

  if (!logData.timestamp) errors.push('timestamp is required');
  if (!logData.traceId) errors.push('traceId is required');
  if (!logData.action?.type) errors.push('action.type is required');
  if (!logData.action?.resource) errors.push('action.resource is required');
  if (!logData.request?.ip) errors.push('request.ip is required');

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  generateTraceId,
  hashSensitiveData,
  sanitizeObject,
  truncateString,
  truncateObject,
  parseUserAgent,
  determineAction,
  determineResource,
  extractResourceId,
  calculateDuration,
  formatTimestamp,
  shouldLog,
  createAuditLogStructure,
  validateAuditLog,
};
