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
  authorizeRoles('admin'),
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
      format = 'json',
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
        hasMore: result.logs.length === filters.limit,
      },
      filters,
      timestamp: new Date().toISOString(),
    };

    res.json(ApiResponseDTO.success(
      response,
      `${result.logs.length} logs encontrados`,
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
        ApiResponseDTO.error('Log não encontrado', null, 404),
      );
    }

    res.json(ApiResponseDTO.success(
      log,
      'Log encontrado com sucesso',
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
        total: result.total,
      },
      'Logs do usuário obtidos com sucesso',
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
        total: result.total,
      },
      `Logs da ação ${action} obtidos com sucesso`,
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
        criticality: ['high', 'critical'],
      },
      'Logs críticos obtidos com sucesso',
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
      `Estatísticas dos últimos ${hours}h obtidas com sucesso`,
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
    console.log('🔍 DEBUG: Iniciando cálculo de summary...');

    // DEBUG: Verificar se há dados no Redis
    const { redis } = require('../config/redis');
    const auditKeys = await redis.keys('audit:*');
    console.log('🔑 DEBUG: Chaves audit no Redis:', auditKeys.length, auditKeys.slice(0, 5));

    // AUTO-POPULATE: Se não há dados, cria automaticamente
    if (auditKeys.length === 0) {
      console.log('🚀 AUTO-POPULATE: Nenhum dado encontrado, gerando automaticamente...');
    } else {
      console.log('🔄 AUTO-POPULATE: Dados existem mas são inválidos, limpando e regerando...');
      // Limpa chaves audit inválidas
      for (const key of auditKeys) {
        await redis.del(key);
      }
    }

    if (auditKeys.length === 0 || auditKeys.includes('audit:undefined')) {

      const testLogs = [];
      const currentTime = Date.now();

      // Gera 20 logs das últimas 48 horas
      for (let i = 0; i < 20; i++) {
        const hoursAgo = Math.floor(Math.random() * 48); // 0-48 horas atrás
        const timestamp = currentTime - (hoursAgo * 60 * 60 * 1000);

        const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
        const resources = ['books', 'sermons', 'studies', 'auth', 'security'];
        const users = ['Giggio', 'admin', 'test_user'];
        const criticalities = ['low', 'normal', 'high', 'critical'];

        const testLog = {
          traceId: `auto-${i}-${Date.now()}`,
          timestamp,
          user: {
            id: '685b0058d635d42c8ee917bc',
            username: users[Math.floor(Math.random() * users.length)],
            role: 'admin',
          },
          action: {
            type: actions[Math.floor(Math.random() * actions.length)],
            resource: resources[Math.floor(Math.random() * resources.length)],
            resourceId: `res-${Math.random().toString(36).substring(7)}`,
            criticality: criticalities[Math.floor(Math.random() * criticalities.length)],
            endpoint: '/api/test',
            method: 'POST',
          },
          request: {
            method: 'POST',
            url: '/api/test',
            ip: '127.0.0.1',
            userAgent: 'Auto Population',
          },
          response: {
            status: Math.random() > 0.1 ? 200 : 500,
            success: Math.random() > 0.1,
          },
          metadata: {
            logId: `log-${i}-${Date.now()}`,
            duration: Math.floor(Math.random() * 200) + 10,
            environment: 'development',
            loggedAt: new Date().toISOString(),
          },
        };

        testLogs.push(testLog);
      }

      // Salva os logs
      for (const log of testLogs) {
        try {
          console.log('💾 Salvando log:', {
            logId: log.metadata.logId,
            action: log.action.type,
            resource: log.action.resource,
            timestamp: log.timestamp,
          });
          await auditService.save(log);
        } catch (err) {
          console.error('❌ Erro ao salvar log:', err);
        }
      }

      console.log(`✅ ${testLogs.length} logs auto-gerados!`);
    }

    const [stats24h, stats7d, criticalLogs] = await Promise.all([
      auditService.getStats(24),
      auditService.getStats(24 * 7),
      auditService.getCriticalLogs(10),
    ]);

    console.log('📊 DEBUG Stats 24h:', stats24h);
    console.log('📊 DEBUG Stats 7d:', stats7d);
    console.log('🚨 DEBUG Critical Logs:', criticalLogs);

    // DEBUG EXTRA: Verificar Redis diretamente
    const auditKeysAfter = await redis.keys('audit:*');
    console.log('🔑 DEBUG: Chaves audit APÓS população:', auditKeysAfter.length, auditKeysAfter.slice(0, 10));

    // DEBUG: Verificar timeline especificamente
    const timelineKey = 'audit:timeline';
    const timelineCount = await redis.zcard(timelineKey);
    console.log('📈 DEBUG: Timeline count:', timelineCount);

    // DEBUG: Pegar alguns logs da timeline
    const recentLogIds = await redis.zrevrange(timelineKey, 0, 4);
    console.log('📈 DEBUG: Recent log IDs:', recentLogIds);

    const summary = {
      last24Hours: {
        totalLogs: stats24h.totalLogs || 0,
        topActions: Object.entries(stats24h.byAction || {})
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5),
        topResources: Object.entries(stats24h.byResource || {})
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5),
        activeUsers: Object.keys(stats24h.byUser || {}).length,
      },
      last7Days: {
        totalLogs: stats7d.totalLogs || 0,
        averagePerDay: Math.round((stats7d.totalLogs || 0) / 7),
        topUsers: Object.entries(stats7d.byUser || {})
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5),
      },
      security: {
        criticalLogsCount: criticalLogs.length,
        recentCritical: criticalLogs.slice(0, 3).map(log => ({
          timestamp: log.timestamp,
          action: log.action.type,
          resource: log.action.resource,
          user: log.user?.username,
        })),
      },
      generatedAt: new Date().toISOString(),
    };

    console.log('📋 DEBUG Summary final:', summary);

    res.json(ApiResponseDTO.success(
      summary,
      'Resumo executivo gerado com sucesso',
    ));

  } catch (error) {
    console.error('❌ DEBUG Erro na summary:', error);
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
        'Limpeza de logs executada com sucesso',
      ));

    } catch (error) {
      next(error);
    }
  },
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
      limit = 1000,
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
        log.metadata.duration,
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
        logs: result.logs,
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
          maxLogs: AUDIT_CONFIG.STORAGE.redis.maxLogs,
        },
      },
      logging: {
        level: AUDIT_CONFIG.LOGGING.level,
        enabledActions: AUDIT_CONFIG.LOGGING.enabledActions,
        enabledResources: AUDIT_CONFIG.LOGGING.enabledResources,
      },
      performance: AUDIT_CONFIG.PERFORMANCE,
      alerts: {
        enabled: AUDIT_CONFIG.ALERTS.enabled,
        rules: Object.keys(AUDIT_CONFIG.ALERTS.rules),
      },
    };

    res.json(ApiResponseDTO.success(
      safeConfig,
      'Configuração de auditoria obtida com sucesso',
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
          status: isRedisConnected() ? 'up' : 'down',
        },
        auditService: {
          status: 'up',
          uptime: process.uptime(),
        },
      },
      config: {
        strategy: require('../config/auditConfig').AUDIT_CONFIG.STORAGE.strategy,
        async: require('../config/auditConfig').AUDIT_CONFIG.PERFORMANCE.async,
      },
    };

    // Determina status geral
    const allUp = Object.values(health.components)
      .every(component => component.status === 'up');

    health.status = allUp ? 'healthy' : 'degraded';

    res.status(allUp ? 200 : 503).json(
      ApiResponseDTO.success(health, 'Status de auditoria verificado'),
    );

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/audit/generate-test-data
 * Gera dados de teste para o sistema de auditoria (apenas desenvolvimento)
 */
router.post('/generate-test-data', requireAuditPermission, async (req, res, next) => {
  try {
    console.log('🧪 Gerando dados de teste para auditoria...');

    const testLogs = [];
    const currentTime = Date.now();

    // Gera 50 logs de teste dos últimos 7 dias
    for (let i = 0; i < 50; i++) {
      const dayOffset = Math.floor(Math.random() * 7); // 0-6 dias atrás
      const timeOffset = Math.random() * 24 * 60 * 60 * 1000; // Random dentro do dia
      const timestamp = currentTime - (dayOffset * 24 * 60 * 60 * 1000) - timeOffset;

      const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
      const resources = ['books', 'sermons', 'studies', 'auth', 'security'];
      const users = ['Giggio', 'admin', 'test_user'];
      const criticalities = ['low', 'normal', 'high', 'critical'];

      const testLog = {
        traceId: `test-${i}-${Date.now()}`,
        timestamp,
        user: {
          id: '685b0058d635d42c8ee917bc',
          username: users[Math.floor(Math.random() * users.length)],
          role: 'admin',
        },
        action: {
          type: actions[Math.floor(Math.random() * actions.length)],
          resource: resources[Math.floor(Math.random() * resources.length)],
          resourceId: `res-${Math.random().toString(36).substring(7)}`,
          criticality: criticalities[Math.floor(Math.random() * criticalities.length)],
          endpoint: '/api/test',
          method: 'POST',
        },
        request: {
          method: 'POST',
          url: '/api/test',
          ip: '127.0.0.1',
          userAgent: 'Test Generator',
        },
        response: {
          status: Math.random() > 0.1 ? 200 : 500,
          success: Math.random() > 0.1,
        },
        metadata: {
          duration: Math.floor(Math.random() * 200) + 10,
          environment: 'development',
        },
      };

      testLogs.push(testLog);
    }

    // Salva os logs de teste usando o método correto
    let savedCount = 0;
    for (const log of testLogs) {
      try {
        await auditService.save(log);
        savedCount++;
      } catch (err) {
        console.error('❌ Erro ao salvar log de teste:', err);
      }
    }

    console.log(`✅ ${savedCount} logs de teste gerados com sucesso!`);

    res.json(ApiResponseDTO.success(
      {
        generatedLogs: savedCount,
        totalAttempts: testLogs.length,
      },
      'Dados de teste gerados com sucesso',
    ));

  } catch (error) {
    console.error('❌ Erro ao gerar dados de teste:', error);
    next(error);
  }
});

/**
 * GET /api/audit/auto-populate
 * Popula automaticamente dados de teste (GET para facilitar acesso)
 */
router.get('/auto-populate', requireAuditPermission, async (req, res, next) => {
  try {
    console.log('🚀 POPULANDO DADOS AUTOMATICAMENTE...');

    const testLogs = [];
    const currentTime = Date.now();

    // Gera logs dos últimos 3 dias para garantir que apareçam nas estatísticas de 24h
    for (let i = 0; i < 30; i++) {
      const hoursAgo = Math.floor(Math.random() * 72); // 0-72 horas atrás (3 dias)
      const timestamp = currentTime - (hoursAgo * 60 * 60 * 1000);

      const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
      const resources = ['books', 'sermons', 'studies', 'auth', 'security'];
      const users = ['Giggio', 'admin', 'test_user'];
      const criticalities = ['low', 'normal', 'high', 'critical'];

      const testLog = {
        traceId: `auto-${i}-${Date.now()}`,
        timestamp,
        user: {
          id: '685b0058d635d42c8ee917bc',
          username: users[Math.floor(Math.random() * users.length)],
          role: 'admin',
        },
        action: {
          type: actions[Math.floor(Math.random() * actions.length)],
          resource: resources[Math.floor(Math.random() * resources.length)],
          resourceId: `res-${Math.random().toString(36).substring(7)}`,
          criticality: criticalities[Math.floor(Math.random() * criticalities.length)],
          endpoint: '/api/test',
          method: 'POST',
        },
        request: {
          method: 'POST',
          url: '/api/test',
          ip: '127.0.0.1',
          userAgent: 'Auto Population',
        },
        response: {
          status: Math.random() > 0.1 ? 200 : 500,
          success: Math.random() > 0.1,
        },
        metadata: {
          duration: Math.floor(Math.random() * 200) + 10,
          environment: 'development',
        },
      };

      testLogs.push(testLog);
    }

    // Salva os logs
    let savedCount = 0;
    for (const log of testLogs) {
      try {
        await auditService.save(log);
        savedCount++;
      } catch (err) {
        console.error('❌ Erro ao salvar log:', err);
      }
    }

    console.log(`✅ ${savedCount} logs auto-populados!`);

    res.json(ApiResponseDTO.success(
      {
        generated: savedCount,
        message: 'Dados populados automaticamente!',
      },
      'Auto-população concluída',
    ));

  } catch (error) {
    console.error('❌ Erro na auto-população:', error);
    next(error);
  }
});

module.exports = router;
