// config/rateLimitConfig.js
/**
 * Configurações centralizadas de Rate Limiting
 * Este arquivo permite ajustar facilmente os limites de segurança
 */

const RATE_LIMIT_PROFILES = {
    // Perfil de desenvolvimento (mais permissivo)
    DEVELOPMENT: {
        LOGIN: {
            WINDOW_MS: 5 * 60 * 1000, // 5 minutos
            MAX_ATTEMPTS: 10,
            PROGRESSIVE_DELAY: false,
            BLOCK_DURATION: 5 * 60, // 5 minutos
        },
        AUTH: {
            WINDOW_MS: 5 * 60 * 1000,
            MAX_ATTEMPTS: 20,
            PROGRESSIVE_DELAY: false,
            BLOCK_DURATION: 2 * 60, // 2 minutos
        }
    },

    // Perfil de produção (mais restritivo)
    PRODUCTION: {
        LOGIN: {
            WINDOW_MS: 15 * 60 * 1000, // 15 minutos
            MAX_ATTEMPTS: 5,
            PROGRESSIVE_DELAY: true,
            BLOCK_DURATION: 30 * 60, // 30 minutos
        },
        AUTH: {
            WINDOW_MS: 10 * 60 * 1000, // 10 minutos
            MAX_ATTEMPTS: 10,
            PROGRESSIVE_DELAY: true,
            BLOCK_DURATION: 15 * 60, // 15 minutos
        }
    },

    // Perfil de alta segurança (muito restritivo)
    HIGH_SECURITY: {
        LOGIN: {
            WINDOW_MS: 30 * 60 * 1000, // 30 minutos
            MAX_ATTEMPTS: 3,
            PROGRESSIVE_DELAY: true,
            BLOCK_DURATION: 60 * 60, // 1 hora
        },
        AUTH: {
            WINDOW_MS: 15 * 60 * 1000, // 15 minutos
            MAX_ATTEMPTS: 5,
            PROGRESSIVE_DELAY: true,
            BLOCK_DURATION: 30 * 60, // 30 minutos
        }
    }
};

/**
 * Seleciona o perfil baseado no ambiente
 */
function getActiveProfile() {
    const environment = process.env.NODE_ENV || 'development';
    const securityLevel = process.env.SECURITY_LEVEL || 'normal';

    if (environment === 'production') {
        return securityLevel === 'high' ? 'HIGH_SECURITY' : 'PRODUCTION';
    }

    return 'DEVELOPMENT';
}

/**
 * Configurações aplicadas
 */
const ACTIVE_PROFILE = getActiveProfile();
const RATE_LIMIT_CONFIG = RATE_LIMIT_PROFILES[ACTIVE_PROFILE];

/**
 * IPs e redes confiáveis
 */
const TRUSTED_NETWORKS = [
    '127.0.0.1',     // localhost
    '::1',           // localhost IPv6
    'localhost',     // localhost hostname
    '192.168.0.0/16', // Rede privada
    '10.0.0.0/8',    // Rede privada
    '172.16.0.0/12', // Rede privada
];

/**
 * Configurações de chaves Redis
 */
const REDIS_KEYS = {
    LOGIN_ATTEMPTS: 'rate_limit:login:',
    AUTH_ATTEMPTS: 'rate_limit:auth:',
    BLOCKED_IPS: 'rate_limit:blocked:',
    SECURITY_LOG: 'security:log:',
    WHITELIST: 'rate_limit:whitelist:',
    METRICS: 'rate_limit:metrics:'
};

/**
 * Configurações de logging de segurança
 */
const SECURITY_LOG_CONFIG = {
    RETENTION_HOURS: 72, // 3 dias
    MAX_LOGS_PER_IP: 1000,
    ALERT_THRESHOLDS: {
        BLOCKED_IPS_PER_HOUR: 10,
        FAILED_ATTEMPTS_PER_HOUR: 50,
        UNIQUE_IPS_BLOCKED: 5
    }
};

/**
 * Mensagens de erro personalizadas
 */
const ERROR_MESSAGES = {
    RATE_LIMIT_EXCEEDED: {
        pt: 'Muitas tentativas de login. Tente novamente mais tarde.',
        en: 'Too many login attempts. Please try again later.'
    },
    IP_BLOCKED: {
        pt: 'Seu IP foi temporariamente bloqueado devido a atividade suspeita.',
        en: 'Your IP has been temporarily blocked due to suspicious activity.'
    },
    INVALID_CREDENTIALS: {
        pt: 'Credenciais inválidas.',
        en: 'Invalid credentials.'
    }
};

/**
 * Função para obter mensagem no idioma apropriado
 */
function getMessage(key, language = 'pt') {
    return ERROR_MESSAGES[key]?.[language] || ERROR_MESSAGES[key]?.pt || 'Erro desconhecido';
}

/**
 * Configurações de monitoramento
 */
const MONITORING_CONFIG = {
    ENABLE_METRICS: process.env.ENABLE_RATE_LIMIT_METRICS === 'true',
    METRICS_INTERVAL: 60 * 1000, // 1 minuto
    ALERT_WEBHOOK: process.env.SECURITY_ALERT_WEBHOOK || null,
    ENABLE_EMAIL_ALERTS: process.env.ENABLE_SECURITY_EMAIL_ALERTS === 'true'
};

module.exports = {
    RATE_LIMIT_CONFIG,
    RATE_LIMIT_PROFILES,
    ACTIVE_PROFILE,
    TRUSTED_NETWORKS,
    REDIS_KEYS,
    SECURITY_LOG_CONFIG,
    ERROR_MESSAGES,
    MONITORING_CONFIG,
    getMessage,
    getActiveProfile
};
