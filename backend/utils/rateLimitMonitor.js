// utils/rateLimitMonitor.js
const { redis, isRedisConnected } = require('../config/redis');
const { REDIS_KEYS, SECURITY_LOG_CONFIG, MONITORING_CONFIG } = require('../config/rateLimitConfig');

/**
 * Monitor de Rate Limiting e Segurança
 */
class RateLimitMonitor {
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
            const recentLogs = [];

            for (const key of logKeys) {
                const logData = await redis.get(key);
                if (logData) {
                    const parsed = JSON.parse(logData);
                    if (parsed.timestamp > oneHourAgo) {
                        recentLogs.push(parsed);
                    }
                }
            }

            // Analisa métricas
            const hourlyMetrics = this.analyzeHourlyLogs(recentLogs);

            // Verifica se há alertas necessários
            await this.checkAlerts(hourlyMetrics);

            // Armazena métricas
            await this.storeMetrics(hourlyMetrics);

        } catch (error) {
            console.error('Erro ao coletar métricas:', error);
        }
    }

    /**
     * Analisa logs da última hora
     */
    analyzeHourlyLogs(logs) {
        const metrics = {
            timestamp: Date.now(),
            totalAttempts: 0,
            failedLogins: 0,
            blockedIPs: new Set(),
            uniqueIPs: new Set(),
            events: {}
        };

        logs.forEach(log => {
            metrics.uniqueIPs.add(log.ip);

            if (log.event === 'LOGIN_ATTEMPT') {
                metrics.totalAttempts++;
            } else if (log.event === 'IP_BLOCKED') {
                metrics.blockedIPs.add(log.ip);
            } else if (log.event.includes('FAILED')) {
                metrics.failedLogins++;
            }

            metrics.events[log.event] = (metrics.events[log.event] || 0) + 1;
        });

        return {
            ...metrics,
            blockedIPsCount: metrics.blockedIPs.size,
            uniqueIPsCount: metrics.uniqueIPs.size,
            blockedIPs: Array.from(metrics.blockedIPs),
            uniqueIPs: Array.from(metrics.uniqueIPs)
        };
    }

    /**
     * Verifica se há necessidade de alertas
     */
    async checkAlerts(metrics) {
        const { ALERT_THRESHOLDS } = SECURITY_LOG_CONFIG;
        const alerts = [];

        if (metrics.blockedIPsCount >= ALERT_THRESHOLDS.BLOCKED_IPS_PER_HOUR) {
            alerts.push({
                type: 'HIGH_BLOCKED_IPS',
                message: `${metrics.blockedIPsCount} IPs bloqueados na última hora`,
                severity: 'HIGH',
                data: { blockedIPs: metrics.blockedIPs }
            });
        }

        if (metrics.failedLogins >= ALERT_THRESHOLDS.FAILED_ATTEMPTS_PER_HOUR) {
            alerts.push({
                type: 'HIGH_FAILED_ATTEMPTS',
                message: `${metrics.failedLogins} tentativas de login falharam na última hora`,
                severity: 'MEDIUM',
                data: { failedLogins: metrics.failedLogins }
            });
        }

        if (metrics.uniqueIPsCount >= ALERT_THRESHOLDS.UNIQUE_IPS_BLOCKED) {
            alerts.push({
                type: 'MULTIPLE_IP_ATTACKS',
                message: `Tentativas suspeitas de ${metrics.uniqueIPsCount} IPs diferentes`,
                severity: 'HIGH',
                data: { uniqueIPs: metrics.uniqueIPs }
            });
        }

        // Processa alertas
        for (const alert of alerts) {
            await this.processAlert(alert, metrics);
        }
    }

    /**
     * Processa um alerta de segurança
     */
    async processAlert(alert, metrics) {
        try {
            // Log do alerta
            console.warn(`🚨 ALERTA DE SEGURANÇA: ${alert.message}`);

            // Armazena alerta no Redis
            const alertKey = `${REDIS_KEYS.SECURITY_LOG}alert:${Date.now()}`;
            await redis.setex(alertKey, 7 * 24 * 60 * 60, JSON.stringify({
                ...alert,
                timestamp: Date.now(),
                metrics
            }));

            // Webhook se configurado
            if (MONITORING_CONFIG.ALERT_WEBHOOK) {
                await this.sendWebhookAlert(alert, metrics);
            }

        } catch (error) {
            console.error('Erro ao processar alerta:', error);
        }
    }

    /**
     * Envia alerta via webhook
     */
    async sendWebhookAlert(alert, metrics) {
        try {
            const axios = require('axios');

            const payload = {
                text: `🚨 Alerta de Segurança: ${alert.message}`,
                alert,
                metrics,
                timestamp: new Date().toISOString(),
                server: process.env.SERVER_NAME || 'Pastor Portfolio API'
            };

            await axios.post(MONITORING_CONFIG.ALERT_WEBHOOK, payload, {
                timeout: 5000,
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (error) {
            console.error('Erro ao enviar webhook:', error);
        }
    }

    /**
     * Armazena métricas no Redis
     */
    async storeMetrics(metrics) {
        if (!isRedisConnected()) return;

        try {
            const metricsKey = `${REDIS_KEYS.METRICS}${Math.floor(Date.now() / (60 * 60 * 1000))}h`;
            await redis.setex(metricsKey, 7 * 24 * 60 * 60, JSON.stringify(metrics)); // 7 dias
        } catch (error) {
            console.error('Erro ao armazenar métricas:', error);
        }
    }

    /**
     * Reset das métricas diárias
     */
    resetDailyMetrics() {
        this.metrics = {
            totalAttempts: 0,
            blockedAttempts: 0,
            uniqueIPs: new Set(),
            blockedIPs: new Set(),
            lastResetTime: Date.now()
        };

        console.log('📊 Métricas diárias resetadas');
    }

    /**
     * Obtém relatório de segurança
     */
    async getSecurityReport(hours = 24) {
        if (!isRedisConnected()) {
            return { error: 'Redis não conectado' };
        }

        try {
            const now = Date.now();
            const timeWindow = now - (hours * 60 * 60 * 1000);

            // Busca logs do período
            const logKeys = await redis.keys(`${REDIS_KEYS.SECURITY_LOG}*`);
            const logs = [];

            for (const key of logKeys) {
                const logData = await redis.get(key);
                if (logData) {
                    const parsed = JSON.parse(logData);
                    if (parsed.timestamp > timeWindow) {
                        logs.push(parsed);
                    }
                }
            }

            // Busca métricas armazenadas
            const currentHour = Math.floor(now / (60 * 60 * 1000));
            const metricsKeys = [];
            for (let i = 0; i < hours; i++) {
                metricsKeys.push(`${REDIS_KEYS.METRICS}${currentHour - i}h`);
            }

            const storedMetrics = [];
            for (const key of metricsKeys) {
                const metrics = await redis.get(key);
                if (metrics) {
                    storedMetrics.push(JSON.parse(metrics));
                }
            }

            return {
                period: { hours, from: new Date(timeWindow), to: new Date(now) },
                summary: this.generateSummary(logs),
                hourlyMetrics: storedMetrics,
                recentLogs: logs.slice(-50), // Últimos 50 logs
                alerts: logs.filter(log => log.event && log.event.includes('alert'))
            };

        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            return { error: error.message };
        }
    }

    /**
     * Gera resumo dos logs
     */
    generateSummary(logs) {
        const summary = {
            totalEvents: logs.length,
            uniqueIPs: new Set(),
            eventTypes: {},
            blockedIPs: new Set(),
            timeRange: { start: null, end: null }
        };

        logs.forEach(log => {
            summary.uniqueIPs.add(log.ip);
            summary.eventTypes[log.event] = (summary.eventTypes[log.event] || 0) + 1;

            if (log.event === 'IP_BLOCKED') {
                summary.blockedIPs.add(log.ip);
            }

            if (!summary.timeRange.start || log.timestamp < summary.timeRange.start) {
                summary.timeRange.start = log.timestamp;
            }
            if (!summary.timeRange.end || log.timestamp > summary.timeRange.end) {
                summary.timeRange.end = log.timestamp;
            }
        });

        return {
            ...summary,
            uniqueIPsCount: summary.uniqueIPs.size,
            blockedIPsCount: summary.blockedIPs.size,
            topEvents: Object.entries(summary.eventTypes)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10),
            timeRange: {
                start: summary.timeRange.start ? new Date(summary.timeRange.start) : null,
                end: summary.timeRange.end ? new Date(summary.timeRange.end) : null
            }
        };
    }

    /**
     * Limpa logs antigos
     */
    async cleanupOldLogs() {
        if (!isRedisConnected()) return;

        try {
            const retentionTime = Date.now() - (SECURITY_LOG_CONFIG.RETENTION_HOURS * 60 * 60 * 1000);
            const logKeys = await redis.keys(`${REDIS_KEYS.SECURITY_LOG}*`);
            let deletedCount = 0;

            for (const key of logKeys) {
                const timestamp = parseInt(key.split(':').pop());
                if (timestamp && timestamp < retentionTime) {
                    await redis.del(key);
                    deletedCount++;
                }
            }

            if (deletedCount > 0) {
                console.log(`🧹 Limpeza: ${deletedCount} logs antigos removidos`);
            }

        } catch (error) {
            console.error('Erro na limpeza de logs:', error);
        }
    }
}

// Instância singleton
const monitor = new RateLimitMonitor();

// Auto-start se habilitado
if (MONITORING_CONFIG.ENABLE_METRICS) {
    monitor.startMonitoring();
}

// Limpeza automática diária
setInterval(() => {
    monitor.cleanupOldLogs();
}, 24 * 60 * 60 * 1000);

module.exports = {
    monitor,
    RateLimitMonitor
};
