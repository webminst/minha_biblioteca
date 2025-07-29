import { redis, isRedisConnected } from '../config/redis';
import { REDIS_KEYS, SECURITY_LOG_CONFIG, MONITORING_CONFIG } from '../config/rateLimitConfig';

/**
 * Monitor de Rate Limiting e Segurança
 */
export class RateLimitMonitor {
    isMonitoring: boolean;
    metrics: {
        totalAttempts: number;
        blockedAttempts: number;
        uniqueIPs: Set<string>;
        blockedIPs: Set<string>;
        lastResetTime: number;
    };
    constructor() {
        this.isMonitoring = false;
        this.metrics = {
            totalAttempts: 0,
            blockedAttempts: 0,
            uniqueIPs: new Set(),
            blockedIPs: new Set(),
            lastResetTime: Date.now()
        };
    }

    /**
     * Inicia o monitoramento se habilitado
     */
    startMonitoring() {
        if (!MONITORING_CONFIG.ENABLE_METRICS || this.isMonitoring) return;
        this.isMonitoring = true;
        console.log('📊 Rate Limit Monitor iniciado');
        // Coleta métricas a cada intervalo configurado
        setInterval(() => {
            this.collectMetrics();
        }, MONITORING_CONFIG.METRICS_INTERVAL);
        // Reset diário das métricas
        setInterval(() => {
            this.resetDailyMetrics();
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * Coleta métricas do Redis
     */
    async collectMetrics() {
        if (!isRedisConnected()) return;
        try {
            const now = Date.now();
            const oneHourAgo = now - (60 * 60 * 1000);
            // Busca logs de segurança da última hora
            const logKeys = await redis.keys(`${REDIS_KEYS.SECURITY_LOG}*`);
            const recentLogs: any[] = [];
            for (const key of logKeys) {
                const logData = await redis.get(key);
                if (logData) {
                    const parsed = JSON.parse(logData);
                    if (parsed.timestamp > oneHourAgo) {
                        recentLogs.push(parsed);
                    }
                }
            }
            // Atualiza métricas
            this.metrics.totalAttempts = recentLogs.length;
            this.metrics.uniqueIPs = new Set(recentLogs.map(log => log.ip));
            this.metrics.blockedAttempts = recentLogs.filter(log => log.blocked).length;
            this.metrics.blockedIPs = new Set(recentLogs.filter(log => log.blocked).map(log => log.ip));
        } catch (err) {
            console.error('Erro ao coletar métricas de rate limit:', err);
        }
    }

    /**
     * Reseta métricas diárias
     */
    resetDailyMetrics() {
        this.metrics = {
            totalAttempts: 0,
            blockedAttempts: 0,
            uniqueIPs: new Set(),
            blockedIPs: new Set(),
            lastResetTime: Date.now()
        };
    }

    /**
     * Retorna snapshot das métricas
     */
    getMetricsSnapshot() {
        return {
            totalAttempts: this.metrics.totalAttempts,
            blockedAttempts: this.metrics.blockedAttempts,
            uniqueIPs: Array.from(this.metrics.uniqueIPs),
            blockedIPs: Array.from(this.metrics.blockedIPs),
            lastResetTime: this.metrics.lastResetTime
        };
    }
}
