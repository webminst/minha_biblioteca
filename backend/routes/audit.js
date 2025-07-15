// routes/audit.js
/**
 * Rotas de Auditoria
 * Endpoints para consultar e gerenciar logs de auditoria
 */

const express = require('express');
const router = express.Router();
const auditService = require('../services/AuditService');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { auditCriticalActions } = require('../middleware/auditLogger');
const { ApiResponseDTO } = require('../dto');

/**
 * Middleware para verificar permissões de auditoria
 * Apenas admins podem acessar logs de auditoria
 */
const requireAuditPermission = [
    protect,
    authorizeRoles('admin')
];

// ========== ROTAS DE CONSULTA ==========

/**
 * GET /api/audit/logs
 * Lista logs de auditoria com filtros
 */
router.get('/logs', requireAuditPermission, async (req, res, next) => {
    try {
        const {
            startDate,
            endDate,
            userId,
            action,
            resource,
            limit = 50,
            offset = 0,
            format = 'json'
        } = req.query;

        // Valida parâmetros
        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (userId) filters.userId = userId;
        if (action) filters.action = action;
        if (resource) filters.resource = resource;
        if (limit) filters.limit = Math.min(parseInt(limit), 1000); // Max 1000
        if (offset) filters.offset = parseInt(offset);

        const result = await auditService.getLogs(filters);

        // Adiciona metadados
        const response = {
            logs: result.logs,
            pagination: {
                total: result.total,
                limit: filters.limit || 50,
                offset: filters.offset || 0,
                hasMore: result.logs.length === filters.limit
            },
            filters: filters,
            timestamp: new Date().toISOString()
        };

        res.json(ApiResponseDTO.success(
            response,
            `${result.logs.length} logs encontrados`
        ));

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/audit/logs/:traceId
 * Busca log específico por trace ID
 */
router.get('/logs/:traceId', requireAuditPermission, async (req, res, next) => {
    try {
        const { traceId } = req.params;

        // Busca logs com o trace ID específico
        const result = await auditService.getLogs({ limit: 1000 });
        const log = result.logs.find(l => l.traceId === traceId);

        if (!log) {
            return res.status(404).json(
                ApiResponseDTO.error('Log não encontrado', null, 404)
            );
        }

        res.json(ApiResponseDTO.success(
            log,
            'Log encontrado com sucesso'
        ));

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/audit/users/:userId/logs
 * Logs específicos de um usuário
 */
router.get('/users/:userId/logs', requireAuditPermission, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { limit = 20 } = req.query;

        const result = await auditService.getLogsByUser(userId, parseInt(limit));

        res.json(ApiResponseDTO.success(
            {
                userId,
                logs: result.logs,
                total: result.total
            },
            `Logs do usuário obtidos com sucesso`
        ));

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/audit/actions/:action/logs
 * Logs específicos de uma ação
 */
router.get('/actions/:action/logs', requireAuditPermission, async (req, res, next) => {
    try {
        const { action } = req.params;
        const { limit = 20 } = req.query;

        const result = await auditService.getLogsByAction(action, parseInt(limit));

        res.json(ApiResponseDTO.success(
            {
                action,
                logs: result.logs,
                total: result.total
            },
            `Logs da ação ${action} obtidos com sucesso`
        ));

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/audit/critical
 * Logs críticos (ações de alta importância)
 */
router.get('/critical', requireAuditPermission, async (req, res, next) => {
    try {
        const { limit = 50 } = req.query;

        const logs = await auditService.getCriticalLogs(parseInt(limit));

        res.json(ApiResponseDTO.success(
            {
                logs,
                count: logs.length,
                criticality: ['high', 'critical']
            },
            'Logs críticos obtidos com sucesso'
        ));

    } catch (error) {
        next(error);
    }
});

// ========== ROTAS DE ESTATÍSTICAS ==========

/**
 * GET /api/audit/stats
 * Estatísticas gerais de auditoria
 */
router.get('/stats', requireAuditPermission, async (req, res, next) => {
    try {
        const { hours = 24 } = req.query;

        const stats = await auditService.getStats(parseInt(hours));

        res.json(ApiResponseDTO.success(
            stats,
            `Estatísticas dos últimos ${hours}h obtidas com sucesso`
        ));

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/audit/summary
 * Resumo executivo da auditoria
 */
router.get('/summary', requireAuditPermission, async (req, res, next) => {
    try {
        const [stats24h, stats7d, criticalLogs] = await Promise.all([
            auditService.getStats(24),
            auditService.getStats(24 * 7),
            auditService.getCriticalLogs(10)
        ]);

        const summary = {
            last24Hours: {
                totalLogs: stats24h.totalLogs || 0,
                topActions: Object.entries(stats24h.byAction || {})
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5),
                topResources: Object.entries(stats24h.byResource || {})
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5),
                activeUsers: Object.keys(stats24h.byUser || {}).length
            },
            last7Days: {
                totalLogs: stats7d.totalLogs || 0,
                averagePerDay: Math.round((stats7d.totalLogs || 0) / 7),
                topUsers: Object.entries(stats7d.byUser || {})
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
            },
            security: {
                criticalLogsCount: criticalLogs.length,
                recentCritical: criticalLogs.slice(0, 3).map(log => ({
                    timestamp: log.timestamp,
                    action: log.action.type,
                    resource: log.action.resource,
                    user: log.user?.username
                }))
            },
            generatedAt: new Date().toISOString()
        };

        res.json(ApiResponseDTO.success(
            summary,
            'Resumo executivo gerado com sucesso'
        ));

    } catch (error) {
        next(error);
    }
});

// ========== ROTAS DE GESTÃO ==========

/**
 * POST /api/audit/cleanup
 * Força limpeza de logs antigos
 */
router.post('/cleanup',
    requireAuditPermission,
    auditCriticalActions(), // Audita esta ação crítica
    async (req, res, next) => {
        try {
            await auditService.cleanup();

            res.json(ApiResponseDTO.success(
                { cleanedAt: new Date().toISOString() },
                'Limpeza de logs executada com sucesso'
            ));

        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/audit/export
 * Exporta logs em diferentes formatos
 */
router.get('/export', requireAuditPermission, async (req, res, next) => {
    try {
        const {
            format = 'json',
            startDate,
            endDate,
            limit = 1000
        } = req.query;

        // Busca logs para exportação
        const filters = { limit: Math.min(parseInt(limit), 5000) };
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        const result = await auditService.getLogs(filters);

        // Define headers baseado no formato
        switch (format.toLowerCase()) {
            case 'csv':
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');

                // Converte para CSV (implementação básica)
                const csvHeaders = 'timestamp,traceId,userId,username,action,resource,endpoint,method,status,ip,duration\n';
                const csvRows = result.logs.map(log => [
                    log.timestamp,
                    log.traceId,
                    log.user?.id || '',
                    log.user?.username || '',
                    log.action.type,
                    log.action.resource,
                    log.action.endpoint,
                    log.action.method,
                    log.response.status,
                    log.request.ip,
                    log.metadata.duration
                ].map(field => `"${field}"`).join(',')).join('\n');

                res.send(csvHeaders + csvRows);
                break;

            case 'json':
            default:
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.json');

                res.json({
                    exportedAt: new Date().toISOString(),
                    format: 'json',
                    filters,
                    count: result.logs.length,
                    logs: result.logs
                });
                break;
        }

    } catch (error) {
        next(error);
    }
});

// ========== ROTAS DE CONFIGURAÇÃO ==========

/**
 * GET /api/audit/config
 * Retorna configuração atual de auditoria
 */
router.get('/config', requireAuditPermission, async (req, res, next) => {
    try {
        const { AUDIT_CONFIG } = require('../config/auditConfig');

        // Remove informações sensíveis da configuração
        const safeConfig = {
            storage: {
                strategy: AUDIT_CONFIG.STORAGE.strategy,
                redis: {
                    ttl: AUDIT_CONFIG.STORAGE.redis.ttl,
                    maxLogs: AUDIT_CONFIG.STORAGE.redis.maxLogs
                }
            },
            logging: {
                level: AUDIT_CONFIG.LOGGING.level,
                enabledActions: AUDIT_CONFIG.LOGGING.enabledActions,
                enabledResources: AUDIT_CONFIG.LOGGING.enabledResources
            },
            performance: AUDIT_CONFIG.PERFORMANCE,
            alerts: {
                enabled: AUDIT_CONFIG.ALERTS.enabled,
                rules: Object.keys(AUDIT_CONFIG.ALERTS.rules)
            }
        };

        res.json(ApiResponseDTO.success(
            safeConfig,
            'Configuração de auditoria obtida com sucesso'
        ));

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/audit/health
 * Status de saúde do sistema de auditoria
 */
router.get('/health', requireAuditPermission, async (req, res, next) => {
    try {
        const { isRedisConnected } = require('../config/redis');

        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            components: {
                redis: {
                    connected: isRedisConnected(),
                    status: isRedisConnected() ? 'up' : 'down'
                },
                auditService: {
                    status: 'up',
                    uptime: process.uptime()
                }
            },
            config: {
                strategy: require('../config/auditConfig').AUDIT_CONFIG.STORAGE.strategy,
                async: require('../config/auditConfig').AUDIT_CONFIG.PERFORMANCE.async
            }
        };

        // Determina status geral
        const allUp = Object.values(health.components)
            .every(component => component.status === 'up');

        health.status = allUp ? 'healthy' : 'degraded';

        res.status(allUp ? 200 : 503).json(
            ApiResponseDTO.success(health, 'Status de auditoria verificado')
        );

    } catch (error) {
        next(error);
    }
});

module.exports = router;
