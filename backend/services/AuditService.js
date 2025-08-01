// services/AuditService.js
/**
 * Serviço de Auditoria
 * Gerencia coleta, armazenamento e consulta de logs de auditoria
 */

const { redis, isRedisConnected } = require('../config/redis');
const { AUDIT_CONFIG } = require('../config/auditConfig');
const {
  generateTraceId,
  validateAuditLog,
  shouldLog,
  formatTimestamp,
} = require('../utils/auditUtils');

/**
 * Buffer de logs para batch processing
 */
class LogBuffer {
  constructor() {
    this.buffer = [];
    this.flushInterval = null;
    this.maxSize = AUDIT_CONFIG.STORAGE.redis.batchSize;
    this.flushTime = AUDIT_CONFIG.PERFORMANCE.batchInterval;

    this.startFlushTimer();
  }

  add(logData) {
    this.buffer.push(logData);

    // Flush se buffer estiver cheio
    if (this.buffer.length >= this.maxSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.buffer.length === 0) return;

    const logsToFlush = [...this.buffer];
    this.buffer = [];

    try {
      const auditService = require('./AuditService');
      await auditService.saveBatch(logsToFlush);
    } catch (error) {
      console.error('❌ Erro ao fazer flush do buffer de auditoria:', error);
      // Em caso de erro, tenta salvar individualmente
      const auditService = require('./AuditService');
      for (const log of logsToFlush) {
        try {
          await auditService.save(log);
        } catch (individualError) {
          console.error('❌ Erro ao salvar log individual:', individualError);
        }
      }
    }
  }

  startFlushTimer() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.flushTime);
  }

  stop() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush(); // Flush final
  }
}

/**
 * Serviço Principal de Auditoria
 */
class AuditService {
  constructor() {
    this.buffer = AUDIT_CONFIG.PERFORMANCE.buffer ? new LogBuffer() : null;
    this.alertRules = AUDIT_CONFIG.ALERTS.rules;
  }

  /**
     * Registra um log de auditoria
     */
  async log(logData) {
    try {
      // Valida estrutura do log
      const validation = validateAuditLog(logData);
      if (!validation.isValid) {
        console.warn('⚠️ Log de auditoria inválido:', validation.errors);
        return false;
      }

      // Verifica se deve fazer log
      if (!shouldLog(
        logData.action.method,
        logData.action.endpoint,
        logData.request.userAgent?.raw,
        logData.request.ip,
      )) {
        return false;
      }

      // Adiciona metadados extras
      logData.metadata.logId = generateTraceId();
      logData.metadata.loggedAt = formatTimestamp();

      // Processa de forma assíncrona se configurado
      if (AUDIT_CONFIG.PERFORMANCE.async) {
        if (this.buffer) {
          this.buffer.add(logData);
        } else {
          setImmediate(() => this.save(logData));
        }
      } else {
        await this.save(logData);
      }

      // Verifica alertas
      this.checkAlerts(logData);

      return true;

    } catch (error) {
      console.error('❌ Erro ao registrar log de auditoria:', error);
      return false;
    }
  }

  /**
     * Salva um log individual
     */
  async save(logData) {
    // Garante que há um logId - essencial para o Redis
    if (!logData.metadata) {
      logData.metadata = {};
    }
    if (!logData.metadata.logId) {
      logData.metadata.logId = generateTraceId();
      console.log('🔧 LogId gerado automaticamente:', logData.metadata.logId);
    }

    const promises = [];

    // Salva no Redis se habilitado
    if (['REDIS_ONLY', 'REDIS_MONGODB'].includes(AUDIT_CONFIG.STORAGE.strategy) && isRedisConnected()) {
      promises.push(this.saveToRedis(logData));
    }

    // Salva no MongoDB se habilitado
    if (['MONGODB_ONLY', 'REDIS_MONGODB'].includes(AUDIT_CONFIG.STORAGE.strategy)) {
      promises.push(this.saveToMongoDB(logData));
    }

    // Salva em paralelo
    const results = await Promise.allSettled(promises);

    // Verifica se pelo menos uma operação foi bem-sucedida
    const hasSuccess = results.some(result => result.status === 'fulfilled');

    if (!hasSuccess) {
      throw new Error('Falha ao salvar em todos os storages configurados');
    }

    return true;
  }

  /**
     * Salva batch de logs
     */
  async saveBatch(logs) {
    const promises = [];

    if (['REDIS_ONLY', 'REDIS_MONGODB'].includes(AUDIT_CONFIG.STORAGE.strategy) && isRedisConnected()) {
      promises.push(this.saveBatchToRedis(logs));
    }

    if (['MONGODB_ONLY', 'REDIS_MONGODB'].includes(AUDIT_CONFIG.STORAGE.strategy)) {
      promises.push(this.saveBatchToMongoDB(logs));
    }

    await Promise.allSettled(promises);
  }

  /**
     * Salva no Redis
     */
  async saveToRedis(logData) {
    const logId = logData.metadata?.logId;
    console.log('💾 REDIS SAVE - LogId:', logId, 'Type:', typeof logId);

    if (!logId) {
      throw new Error('LogId é obrigatório para salvar no Redis');
    }

    const key = `${AUDIT_CONFIG.STORAGE.redis.keyPrefix}${logId}`;
    const ttl = AUDIT_CONFIG.STORAGE.redis.ttl;

    console.log('💾 REDIS SAVE - Key:', key, 'TTL:', ttl);

    await redis.setex(key, ttl, JSON.stringify(logData));

    // Adiciona à lista ordenada por timestamp
    const listKey = `${AUDIT_CONFIG.STORAGE.redis.keyPrefix}timeline`;
    const timestamp = logData.timestamp || Date.now();
    console.log('💾 REDIS TIMELINE - Adding:', logId, 'at timestamp:', timestamp);

    await redis.zadd(listKey, timestamp, logId);

    // Mantém apenas os logs mais recentes
    const maxLogs = AUDIT_CONFIG.STORAGE.redis.maxLogs;
    await redis.zremrangebyrank(listKey, 0, -(maxLogs + 1));

    console.log('✅ REDIS SAVE COMPLETO para logId:', logId);
  }

  /**
     * Salva batch no Redis
     */
  async saveBatchToRedis(logs) {
    const pipeline = redis.pipeline();
    const listKey = `${AUDIT_CONFIG.STORAGE.redis.keyPrefix}timeline`;
    const ttl = AUDIT_CONFIG.STORAGE.redis.ttl;

    for (const logData of logs) {
      const key = `${AUDIT_CONFIG.STORAGE.redis.keyPrefix}${logData.metadata.logId}`;
      pipeline.setex(key, ttl, JSON.stringify(logData));
      pipeline.zadd(listKey, Date.now(), logData.metadata.logId);
    }

    // Limita tamanho da timeline
    const maxLogs = AUDIT_CONFIG.STORAGE.redis.maxLogs;
    pipeline.zremrangebyrank(listKey, 0, -(maxLogs + 1));

    await pipeline.exec();
  }

  /**
     * Salva no MongoDB (implementação básica)
     */
  async saveToMongoDB(logData) {
    // TODO: Implementar quando necessário
    // Por enquanto, apenas log para indicar que seria salvo
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 MongoDB save:', {
        logId: logData.metadata.logId,
        action: logData.action.type,
        resource: logData.action.resource,
        user: logData.user?.username,
      });
    }
  }

  /**
     * Salva batch no MongoDB
     */
  async saveBatchToMongoDB(logs) {
    // TODO: Implementar quando necessário
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 MongoDB batch save: ${logs.length} logs`);
    }
  }

  /**
     * Busca logs com filtros
     */
  async getLogs(filters = {}) {
    const {
      startDate,
      endDate,
      userId,
      action,
      resource,
      limit = 50,
      offset = 0,
    } = filters;

    if (!isRedisConnected()) {
      return { logs: [], total: 0 };
    }

    try {
      const listKey = `${AUDIT_CONFIG.STORAGE.redis.keyPrefix}timeline`;

      // Define range de tempo
      const start = startDate ? new Date(startDate).getTime() : 0;
      const end = endDate ? new Date(endDate).getTime() : Date.now();

      // Busca IDs dos logs no range
      const logIds = await redis.zrevrangebyscore(
        listKey,
        end,
        start,
        'LIMIT',
        offset,
        limit,
      );

      if (logIds.length === 0) {
        return { logs: [], total: 0 };
      }

      // Busca dados dos logs
      const pipeline = redis.pipeline();
      logIds.forEach(logId => {
        const key = `${AUDIT_CONFIG.STORAGE.redis.keyPrefix}${logId}`;
        pipeline.get(key);
      });

      const results = await pipeline.exec();
      const logs = [];

      for (let i = 0; i < results.length; i++) {
        const [error, data] = results[i];
        if (!error && data) {
          try {
            const logData = JSON.parse(data);

            // Aplica filtros
            if (userId && logData.user?.id !== userId) continue;
            if (action && logData.action.type !== action) continue;
            if (resource && logData.action.resource !== resource) continue;

            logs.push(logData);
          } catch (parseError) {
            console.warn('⚠️ Erro ao fazer parse do log:', parseError);
          }
        }
      }

      // Conta total (aproximado)
      const total = await redis.zcard(listKey);

      return { logs, total };

    } catch (error) {
      console.error('❌ Erro ao buscar logs:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
     * Busca logs por usuário
     */
  async getLogsByUser(userId, limit = 20) {
    return this.getLogs({ userId, limit });
  }

  /**
     * Busca logs por ação
     */
  async getLogsByAction(action, limit = 20) {
    return this.getLogs({ action, limit });
  }

  /**
     * Busca logs críticos
     */
  async getCriticalLogs(limit = 50) {
    const { logs } = await this.getLogs({ limit: limit * 3 }); // Busca mais para filtrar

    return logs.filter(log =>
      ['high', 'critical'].includes(log.action.criticality),
    ).slice(0, limit);
  }

  /**
     * Estatísticas de auditoria
     */
  async getStats(hours = 24) {
    if (!isRedisConnected()) {
      return { error: 'Redis não disponível' };
    }

    try {
      const startTime = Date.now() - (hours * 60 * 60 * 1000);
      const listKey = `${AUDIT_CONFIG.STORAGE.redis.keyPrefix}timeline`;

      const logIds = await redis.zrangebyscore(listKey, startTime, Date.now());

      if (logIds.length === 0) {
        return {
          totalLogs: 0,
          timeRange: `${hours} horas`,
          byAction: {},
          byResource: {},
          byUser: {},
          recentActivity: [],
        };
      }

      // Busca amostra dos logs para estatísticas
      const sampleSize = Math.min(logIds.length, 100);
      const sampleIds = logIds.slice(-sampleSize);

      const pipeline = redis.pipeline();
      sampleIds.forEach(logId => {
        const key = `${AUDIT_CONFIG.STORAGE.redis.keyPrefix}${logId}`;
        pipeline.get(key);
      });

      const results = await pipeline.exec();
      const stats = {
        totalLogs: logIds.length,
        timeRange: `${hours} horas`,
        byAction: {},
        byResource: {},
        byUser: {},
        recentActivity: [],
      };

      for (const [error, data] of results) {
        if (!error && data) {
          try {
            const log = JSON.parse(data);

            // Conta por ação
            stats.byAction[log.action.type] = (stats.byAction[log.action.type] || 0) + 1;

            // Conta por recurso
            stats.byResource[log.action.resource] = (stats.byResource[log.action.resource] || 0) + 1;

            // Conta por usuário
            if (log.user) {
              const userKey = log.user.username || log.user.id;
              stats.byUser[userKey] = (stats.byUser[userKey] || 0) + 1;
            }

            // Atividade recente
            if (stats.recentActivity.length < 10) {
              stats.recentActivity.push({
                timestamp: log.timestamp,
                action: log.action.type,
                resource: log.action.resource,
                user: log.user?.username,
                success: log.response.success,
              });
            }
          } catch (parseError) {
            // Ignora erros de parse
          }
        }
      }

      return stats;

    } catch (error) {
      console.error('❌ Erro ao gerar estatísticas:', error);
      return { error: error.message };
    }
  }

  /**
     * Verifica alertas baseado no log
     */
  checkAlerts(logData) {
    if (!AUDIT_CONFIG.ALERTS.enabled) return;

    // Implementação básica de alertas
    const { action, user } = logData;

    // Alerta para ações críticas
    if (['DELETE', 'UNBLOCK_IP', 'CLEAR_LOGS'].includes(action.type)) {
      console.warn(`🚨 ALERTA: Ação crítica ${action.type} executada por ${user?.username || 'usuário desconhecido'} em ${action.resource}`);
    }

    // TODO: Implementar verificações mais sofisticadas
    // - Detecção de múltiplos logins
    // - Ações em massa
    // - Padrões suspeitos
  }

  /**
     * Limpa logs antigos
     */
  async cleanup() {
    if (!isRedisConnected()) return;

    try {
      const listKey = `${AUDIT_CONFIG.STORAGE.redis.keyPrefix}timeline`;
      const cutoff = Date.now() - (AUDIT_CONFIG.STORAGE.redis.ttl * 1000);

      // Remove logs expirados da timeline
      await redis.zremrangebyscore(listKey, 0, cutoff);

      console.log('🧹 Limpeza de logs de auditoria concluída');
    } catch (error) {
      console.error('❌ Erro na limpeza de logs:', error);
    }
  }

  /**
     * Para o serviço (flush final do buffer)
     */
  stop() {
    if (this.buffer) {
      this.buffer.stop();
    }
  }
}

// Instância singleton
const auditService = new AuditService();

// Limpeza automática a cada hora
setInterval(() => {
  auditService.cleanup();
}, 60 * 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Parando serviço de auditoria...');
  auditService.stop();
});

process.on('SIGINT', () => {
  console.log('🔄 Parando serviço de auditoria...');
  auditService.stop();
});

module.exports = auditService;
