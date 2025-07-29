"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
const redis_1 = require("../config/redis");
const rateLimitConfig_1 = require("../config/rateLimitConfig");
/**
 * Classe para gerenciar Rate Limiting com Redis
 */
class RateLimiter {
    constructor() {
        this.fallbackStore = new Map(); // Fallback para quando Redis não estiver disponível
        console.log(`🔒 Rate Limiter inicializado com perfil: ${rateLimitConfig_1.ACTIVE_PROFILE}`);
        this.logConfig();
    }
    /**
     * Log das configurações ativas
     */
    logConfig() {
        console.log('📊 Configurações de Rate Limiting:');
        console.log(`   LOGIN: ${rateLimitConfig_1.RATE_LIMIT_CONFIG.LOGIN.MAX_ATTEMPTS} tentativas em ${rateLimitConfig_1.RATE_LIMIT_CONFIG.LOGIN.WINDOW_MS / 1000 / 60}min`);
        console.log(`   AUTH: ${rateLimitConfig_1.RATE_LIMIT_CONFIG.AUTH.MAX_ATTEMPTS} tentativas em ${rateLimitConfig_1.RATE_LIMIT_CONFIG.AUTH.WINDOW_MS / 1000 / 60}min`);
        console.log(`   Delay progressivo: ${rateLimitConfig_1.RATE_LIMIT_CONFIG.LOGIN.PROGRESSIVE_DELAY ? 'Ativado' : 'Desativado'}`);
    }
    /**
     * Obtém o IP real do cliente
     */
    getClientIP(req) {
        return req.ip ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
            '0.0.0.0';
    }
    /**
     * Verifica se o IP está na whitelist
     */
    isTrustedIP(ip) {
        // Verifica IPs específicos
        if (rateLimitConfig_1.TRUSTED_NETWORKS.includes(ip))
            return true;
        // Verifica redes privadas
        if (ip.startsWith('192.168.') ||
            ip.startsWith('10.') ||
            ip.startsWith('172.'))
            return true;
        return false;
    }
    /**
     * Gera chave Redis baseada no tipo e IP
     */
    generateKey(type, ip, suffix = '') {
        const prefix = rateLimitConfig_1.REDIS_KEYS[type.toUpperCase() + '_ATTEMPTS'] || rateLimitConfig_1.REDIS_KEYS[type.toUpperCase()];
        return `${prefix}${ip}${suffix ? ':' + suffix : ''}`;
    }
    /**
     * Registra tentativa de acesso no Redis
     */
    async recordAttempt(ip, type = 'LOGIN') {
        const key = this.generateKey(type, ip);
        const config = rateLimitConfig_1.RATE_LIMIT_CONFIG[type];
        if ((0, redis_1.isRedisConnected)()) {
            try {
                const current = await redis_1.redis.incr(key);
                if (current === 1) {
                    await redis_1.redis.expire(key, Math.ceil(config.WINDOW_MS / 1000));
                }
                return current;
            }
            catch (error) {
                console.error('Erro ao registrar tentativa no Redis:', error);
            }
        }
        // Fallback local
        const current = (this.fallbackStore.get(key) || 0) + 1;
        this.fallbackStore.set(key, current);
        return current;
    }
}
exports.RateLimiter = RateLimiter;
