// routes/security.js
const express = require('express');
const router = express.Router();
const { monitor } = require('../utils/rateLimitMonitor');
const { redis, isRedisConnected } = require('../config/redis');
const { RATE_LIMIT_CONFIG, ACTIVE_PROFILE } = require('../config/rateLimitConfig');
const { authRateLimit } = require('../middleware/rateLimiter');

/**
 * Middleware de autenticação para rotas de segurança
 * Por enquanto, permite acesso para teste (TODO: implementar auth real)
 */
const requireAuth = (req, res, next) => {
    // TODO: Implementar verificação de admin aqui
    // Por enquanto, permite acesso para demonstração
    next();
};

// Aplica rate limiting nas rotas de segurança
router.use(authRateLimit);

/**
 * GET /api/security/status
 * Retorna status geral do sistema de rate limiting
 */
router.get('/status', requireAuth, async (req, res) => {
    try {
        const status = {
            timestamp: Date.now(),
            activeProfile: ACTIVE_PROFILE,
            redisConnected: isRedisConnected(),
            config: RATE_LIMIT_CONFIG,
            system: {
                uptime: process.uptime(),
                nodeVersion: process.version,
                environment: process.env.NODE_ENV || 'development'
            }
        };

        if (isRedisConnected()) {
            try {
                // Informações do Redis
                const redisInfo = await redis.info();
                const redisMemory = await redis.info('memory');

                status.redis = {
                    connected: true,
                    version: redisInfo.split('\n').find(line => line.startsWith('redis_version'))?.split(':')[1]?.trim(),
                    usedMemory: redisMemory.split('\n').find(line => line.startsWith('used_memory_human'))?.split(':')[1]?.trim(),
                    connectedClients: redisInfo.split('\n').find(line => line.startsWith('connected_clients'))?.split(':')[1]?.trim()
                };
            } catch (redisError) {
                status.redis = { connected: false, error: redisError.message };
            }
        } else {
            status.redis = { connected: false };
        }

        res.json({
            success: true,
            data: status
        });

    } catch (error) {
        console.error('Erro ao obter status:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter status do sistema'
        });
    }
});

/**
 * GET /api/security/report
 * Gera relatório de segurança
 */
router.get('/report', requireAuth, async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 24;
        const report = await monitor.getSecurityReport(hours);

        res.json({
            success: true,
            data: report
        });

    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao gerar relatório de segurança'
        });
    }
});

/**
 * GET /api/security/blocked-ips
 * Lista IPs atualmente bloqueados
 */
router.get('/blocked-ips', requireAuth, async (req, res) => {
    try {
        if (!isRedisConnected()) {
            return res.status(503).json({
                success: false,
                message: 'Redis não disponível'
            });
        }

        const blockedKeys = await redis.keys('rate_limit:blocked:*');
        const blockedIPs = [];

        for (const key of blockedKeys) {
            const data = await redis.get(key);
            if (data) {
                const blockInfo = JSON.parse(data);
                const ip = key.split(':').pop();
                const ttl = await redis.ttl(key);

                blockedIPs.push({
                    ip,
                    blockedAt: new Date(blockInfo.blockedAt),
                    reason: blockInfo.reason,
                    remainingTime: ttl,
                    expiresAt: new Date(Date.now() + (ttl * 1000))
                });
            }
        }

        res.json({
            success: true,
            data: {
                count: blockedIPs.length,
                blockedIPs: blockedIPs.sort((a, b) => b.blockedAt - a.blockedAt)
            }
        });

    } catch (error) {
        console.error('Erro ao listar IPs bloqueados:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar IPs bloqueados'
        });
    }
});

/**
 * POST /api/security/unblock-ip
 * Remove bloqueio de um IP específico
 */
router.post('/unblock-ip', requireAuth, async (req, res) => {
    try {
        const { ip } = req.body;

        if (!ip) {
            return res.status(400).json({
                success: false,
                message: 'IP é obrigatório'
            });
        }

        if (!isRedisConnected()) {
            return res.status(503).json({
                success: false,
                message: 'Redis não disponível'
            });
        }

        // Remove bloqueio
        const blockKey = `rate_limit:blocked:${ip}`;
        const loginKey = `rate_limit:login:${ip}`;
        const authKey = `rate_limit:auth:${ip}`;

        await redis.del(blockKey);
        await redis.del(loginKey);
        await redis.del(authKey);

        // Log da ação
        const logKey = `security:log:${Date.now()}`;
        await redis.setex(logKey, 24 * 60 * 60, JSON.stringify({
            timestamp: Date.now(),
            ip,
            event: 'IP_UNBLOCKED_MANUALLY',
            data: { unblockedBy: 'admin' }
        }));

        res.json({
            success: true,
            message: `IP ${ip} desbloqueado com sucesso`
        });

    } catch (error) {
        console.error('Erro ao desbloquear IP:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao desbloquear IP'
        });
    }
});

/**
 * GET /api/security/metrics
 * Métricas em tempo real
 */
router.get('/metrics', requireAuth, async (req, res) => {
    try {
        if (!isRedisConnected()) {
            return res.status(503).json({
                success: false,
                message: 'Redis não disponível'
            });
        }

        const currentHour = Math.floor(Date.now() / (60 * 60 * 1000));
        const metricsKey = `rate_limit:metrics:${currentHour}h`;
        const metricsData = await redis.get(metricsKey);

        let metrics = null;
        if (metricsData) {
            metrics = JSON.parse(metricsData);
        }

        // Informações básicas em tempo real
        const blockedIPs = await redis.keys('rate_limit:blocked:*');
        const activeAttempts = {
            login: await redis.keys('rate_limit:login:*'),
            auth: await redis.keys('rate_limit:auth:*')
        };

        res.json({
            success: true,
            data: {
                timestamp: Date.now(),
                currentMetrics: metrics,
                realTime: {
                    blockedIPsCount: blockedIPs.length,
                    activeLoginAttempts: activeAttempts.login.length,
                    activeAuthAttempts: activeAttempts.auth.length
                },
                config: {
                    profile: ACTIVE_PROFILE,
                    loginMaxAttempts: RATE_LIMIT_CONFIG.LOGIN.MAX_ATTEMPTS,
                    authMaxAttempts: RATE_LIMIT_CONFIG.AUTH.MAX_ATTEMPTS
                }
            }
        });

    } catch (error) {
        console.error('Erro ao obter métricas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter métricas'
        });
    }
});

/**
 * POST /api/security/clear-logs
 * Limpa logs de segurança antigos
 */
router.post('/clear-logs', requireAuth, async (req, res) => {
    try {
        if (!isRedisConnected()) {
            return res.status(503).json({
                success: false,
                message: 'Redis não disponível'
            });
        }

        await monitor.cleanupOldLogs();

        res.json({
            success: true,
            message: 'Limpeza de logs executada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao limpar logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao limpar logs'
        });
    }
});

module.exports = router;
