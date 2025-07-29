import { redis, getRedisStatus, isRedisConnected } from '../config/redis';
import {
    RATE_LIMIT_CONFIG,
    TRUSTED_NETWORKS,
    REDIS_KEYS,
    getMessage,
    ACTIVE_PROFILE
} from '../config/rateLimitConfig';
import type { Request, Response, NextFunction } from 'express';

/**
 * Classe para gerenciar Rate Limiting com Redis
 */
export class RateLimiter {
    fallbackStore: Map<string, number>;
    constructor() {
        this.fallbackStore = new Map(); // Fallback para quando Redis não estiver disponível
        console.log(`🔒 Rate Limiter inicializado com perfil: ${ACTIVE_PROFILE}`);
        this.logConfig();
    }

    /**
     * Log das configurações ativas
     */
    logConfig() {
        console.log('📊 Configurações de Rate Limiting:');
        console.log(`   LOGIN: ${RATE_LIMIT_CONFIG.LOGIN.MAX_ATTEMPTS} tentativas em ${RATE_LIMIT_CONFIG.LOGIN.WINDOW_MS / 1000 / 60}min`);
        console.log(`   AUTH: ${RATE_LIMIT_CONFIG.AUTH.MAX_ATTEMPTS} tentativas em ${RATE_LIMIT_CONFIG.AUTH.WINDOW_MS / 1000 / 60}min`);
        console.log(`   Delay progressivo: ${RATE_LIMIT_CONFIG.LOGIN.PROGRESSIVE_DELAY ? 'Ativado' : 'Desativado'}`);
    }

    /**
     * Obtém o IP real do cliente
     */
    getClientIP(req: Request): string {
        return req.ip ||
            (req.connection as any).remoteAddress ||
            (req.socket as any).remoteAddress ||
            ((req.connection as any).socket ? (req.connection as any).socket.remoteAddress : null) ||
            '0.0.0.0';
    }

    /**
     * Verifica se o IP está na whitelist
     */
    isTrustedIP(ip: string): boolean {
        // Verifica IPs específicos
        if (TRUSTED_NETWORKS.includes(ip)) return true;
        // Verifica redes privadas
        if (ip.startsWith('192.168.') ||
            ip.startsWith('10.') ||
            ip.startsWith('172.')) return true;
        return false;
    }

    /**
     * Gera chave Redis baseada no tipo e IP
     */
    generateKey(type: string, ip: string, suffix = ''): string {
        const prefix = REDIS_KEYS[type.toUpperCase() + '_ATTEMPTS'] || REDIS_KEYS[type.toUpperCase()];
        return `${prefix}${ip}${suffix ? ':' + suffix : ''}`;
    }

    /**
     * Registra tentativa de acesso no Redis
     */
    async recordAttempt(ip: string, type: string = 'LOGIN'): Promise<number> {
        const key = this.generateKey(type, ip);
        const config = RATE_LIMIT_CONFIG[type];
        if (isRedisConnected()) {
            try {
                const current = await redis.incr(key);
                if (current === 1) {
                    await redis.expire(key, Math.ceil(config.WINDOW_MS / 1000));
                }
                return current;
            } catch (error) {
                console.error('Erro ao registrar tentativa no Redis:', error);
            }
        }
        // Fallback local
        const current = (this.fallbackStore.get(key) || 0) + 1;
        this.fallbackStore.set(key, current);
        return current;
    }
}
