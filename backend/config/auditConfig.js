// config/auditConfig.js
/**
 * Configuração do Sistema de Auditoria
 * Controla como os logs são coletados, armazenados e processados
 */

const AUDIT_CONFIG = {
  // ========== ESTRATÉGIA DE ARMAZENAMENTO ==========
  STORAGE: {
    strategy: 'REDIS_MONGODB', // 'REDIS_ONLY', 'MONGODB_ONLY', 'REDIS_MONGODB'
    redis: {
      ttl: 24 * 60 * 60, // 24 horas em segundos
      keyPrefix: 'audit:',
      maxLogs: 10000, // Máximo de logs em memória
      batchSize: 100, // Logs por batch ao salvar
    },
    mongodb: {
      collection: 'audit_logs',
      indexFields: ['timestamp', 'user.id', 'action.type', 'action.resource'],
      retentionDays: 365, // Manter logs por 1 ano
      maxCollectionSize: '100MB', // Tamanho máximo da collection
    },
  },

  // ========== CONFIGURAÇÃO DE LOGGING ==========
  LOGGING: {
    level: process.env.AUDIT_LEVEL || 'INFO', // DEBUG, INFO, WARN, ERROR
    enabledActions: [
      'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
      'REGISTER', 'REFRESH_TOKEN', 'UNBLOCK_IP', 'CLEAR_LOGS',
    ],
    enabledResources: [
      'books', 'sermons', 'studies', 'users', 'auth', 'security',
    ],
    sensitiveFields: [
      'password', 'token', 'refreshToken', 'accessToken',
      'authorization', 'cookie', 'session',
    ],
    maxBodySize: 2048, // bytes - máximo do body a ser logado
    maxHeaderSize: 512, // bytes - máximo dos headers
  },

  // ========== PERFORMANCE ==========
  PERFORMANCE: {
    async: true, // Log assíncrono para não impactar performance
    buffer: true, // Usar buffer para batch de logs
    batchInterval: 5000, // ms - intervalo para flush do buffer
    timeout: 3000, // ms - timeout para operações de log
    retryAttempts: 3, // tentativas em caso de falha
  },

  // ========== FILTROS E SANITIZAÇÃO ==========
  FILTERS: {
    excludeEndpoints: [
      '/health', '/metrics', '/status',
      '/api/auth/verify', // muito frequente
    ],
    excludeUserAgents: [
      'health-check', 'monitoring',
    ],
    excludeIPs: [
      '127.0.0.1', '::1', // localhost
    ],
  },

  // ========== ALERTAS ==========
  ALERTS: {
    enabled: true,
    rules: {
      suspiciousLogin: {
        enabled: true,
        threshold: 5, // logins em
        timeWindow: 300, // 5 minutos
        action: 'LOG_WARN',
      },
      massiveDeletes: {
        enabled: true,
        threshold: 10, // deletes em
        timeWindow: 600, // 10 minutos
        action: 'LOG_ERROR',
      },
      adminActions: {
        enabled: true,
        actions: ['DELETE', 'CLEAR_LOGS', 'UNBLOCK_IP'],
        action: 'LOG_INFO',
      },
    },
  },

  // ========== COMPLIANCE ==========
  COMPLIANCE: {
    lgpd: {
      enabled: true,
      anonymizeAfterDays: 90,
      deleteAfterDays: 365,
    },
    retention: {
      critical: 365, // dias - logs críticos
      normal: 180,   // dias - logs normais
      debug: 30,      // dias - logs de debug
    },
  },
};

// ========== MAPEAMENTO DE AÇÕES ==========
const ACTION_TYPES = {
  // Autenticação
  'POST:/api/auth/login': 'LOGIN',
  'POST:/api/auth/logout': 'LOGOUT',
  'POST:/api/auth/register': 'REGISTER',
  'POST:/api/auth/refresh': 'REFRESH_TOKEN',

  // Livros
  'POST:/api/books': 'CREATE',
  'PUT:/api/books': 'UPDATE',
  'PATCH:/api/books': 'UPDATE',
  'DELETE:/api/books': 'DELETE',

  // Sermões
  'POST:/api/sermons': 'CREATE',
  'PUT:/api/sermons': 'UPDATE',
  'PATCH:/api/sermons': 'UPDATE',
  'DELETE:/api/sermons': 'DELETE',

  // Estudos
  'POST:/api/studies': 'CREATE',
  'PUT:/api/studies': 'UPDATE',
  'PATCH:/api/studies': 'UPDATE',
  'DELETE:/api/studies': 'DELETE',

  // Segurança
  'POST:/api/security/unblock-ip': 'UNBLOCK_IP',
  'POST:/api/security/clear-logs': 'CLEAR_LOGS',
};

// ========== MAPEAMENTO DE RECURSOS ==========
const RESOURCE_MAPPING = {
  '/api/auth': 'auth',
  '/api/books': 'books',
  '/api/sermons': 'sermons',
  '/api/studies': 'studies',
  '/api/security': 'security',
};

// ========== NÍVEIS DE CRITICIDADE ==========
const CRITICALITY_LEVELS = {
  LOGIN: 'normal',
  LOGOUT: 'low',
  REGISTER: 'high',
  CREATE: 'normal',
  UPDATE: 'normal',
  DELETE: 'high',
  UNBLOCK_IP: 'critical',
  CLEAR_LOGS: 'critical',
  REFRESH_TOKEN: 'low',
};

module.exports = {
  AUDIT_CONFIG,
  ACTION_TYPES,
  RESOURCE_MAPPING,
  CRITICALITY_LEVELS,
};
