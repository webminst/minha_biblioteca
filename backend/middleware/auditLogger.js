// middleware/auditLogger.js
/**
 * Middleware de Auditoria
 * Intercepta requisições e registra logs de auditoria automaticamente
 */

const auditService = require('../services/AuditService');
const { createAuditLogStructure, generateTraceId } = require('../utils/auditUtils');
const { AUDIT_CONFIG } = require('../config/auditConfig');

/**
 * Middleware principal de auditoria
 * Captura todas as requisições e registra logs relevantes
 */
const auditLogger = (options = {}) => {
  const {
    includeBody = true,
    includeHeaders = true,
    includeQuery = true,
    includeParams = true,
    logLevel = AUDIT_CONFIG.LOGGING.level,
  } = options;

  return (req, res, next) => {
    // Só processa se auditoria estiver habilitada
    if (!AUDIT_CONFIG || logLevel === 'OFF') {
      return next();
    }

    // Gera trace ID para rastreamento
    req.traceId = generateTraceId();
    req.startTime = Date.now();

    // Adiciona trace ID ao header de resposta
    res.setHeader('X-Trace-ID', req.traceId);

    // Intercepta o final da resposta
    const originalSend = res.send;
    const originalJson = res.json;
    let responseLogged = false;

    // Função para registrar o log
    const logRequest = async () => {
      if (responseLogged) return;
      responseLogged = true;

      try {
        // Cria estrutura do log
        const logData = createAuditLogStructure(req, res, req.user, req.startTime);

        // Aplica configurações de inclusão
        if (!includeBody) delete logData.request.body;
        if (!includeHeaders) delete logData.request.headers;
        if (!includeQuery) delete logData.request.query;
        if (!includeParams) delete logData.request.params;

        // Registra o log
        await auditService.log(logData);

        // Log de debug se habilitado
        if (logLevel === 'DEBUG') {
          console.log('🔍 Audit Log:', {
            traceId: logData.traceId,
            action: logData.action.type,
            resource: logData.action.resource,
            user: logData.user?.username,
            status: logData.response.status,
            duration: logData.metadata.duration,
          });
        }

      } catch (error) {
        console.error('❌ Erro no middleware de auditoria:', error);
      }
    };

    // Intercepta res.send()
    res.send = function (data) {
      res.send = originalSend;
      const result = originalSend.call(this, data);

      // Registra log de forma assíncrona
      setImmediate(logRequest);

      return result;
    };

    // Intercepta res.json()
    res.json = function (data) {
      res.json = originalJson;
      const result = originalJson.call(this, data);

      // Registra log de forma assíncrona
      setImmediate(logRequest);

      return result;
    };

    // Intercepta final da resposta (fallback)
    res.on('finish', () => {
      setImmediate(logRequest);
    });

    next();
  };
};

/**
 * Middleware específico para ações administrativas
 * Log mais detalhado para operações sensíveis
 */
const auditAdminActions = () => {
  return auditLogger({
    includeBody: true,
    includeHeaders: true,
    includeQuery: true,
    includeParams: true,
    logLevel: 'INFO',
  });
};

/**
 * Middleware para ações de autenticação
 * Log especializado para login/logout
 */
const auditAuthActions = () => {
  return (req, res, next) => {
    // Para ações de auth, adiciona informações extras
    req.authAction = true;
    req.loginAttempt = req.originalUrl.includes('/login');

    return auditLogger({
      includeBody: false, // Não loga senhas
      includeHeaders: true,
      includeQuery: false,
      includeParams: false,
      logLevel: 'INFO',
    })(req, res, next);
  };
};

/**
 * Middleware para logs críticos
 * Usado em operações que requerem auditoria obrigatória
 */
const auditCriticalActions = () => {
  return (req, res, next) => {
    // Marca como ação crítica
    req.criticalAction = true;

    // Força log mesmo se outras configurações desabilitarem
    return auditLogger({
      includeBody: true,
      includeHeaders: true,
      includeQuery: true,
      includeParams: true,
      logLevel: 'INFO', // Sempre loga ações críticas
    })(req, res, next);
  };
};

/**
 * Middleware para adicionar contexto de usuário
 * Deve ser usado após middleware de autenticação
 */
const auditUserContext = () => {
  return (req, res, next) => {
    // Se há usuário autenticado, adiciona ao contexto
    if (req.user) {
      req.auditContext = {
        userId: req.user._id || req.user.id,
        username: req.user.username,
        role: req.user.role,
        authenticatedAt: new Date(),
      };
    }

    next();
  };
};

/**
 * Middleware para logs de erro
 * Captura erros e registra no sistema de auditoria
 */
const auditErrorLogger = () => {
  return (error, req, res, next) => {
    // Se há um trace ID, usa para correlacionar o erro
    if (req.traceId && error) {
      const errorLog = {
        timestamp: new Date().toISOString(),
        traceId: req.traceId,
        level: 'ERROR',
        message: error.message,
        stack: error.stack,
        endpoint: req.originalUrl,
        method: req.method,
        user: req.user ? {
          id: req.user._id || req.user.id,
          username: req.user.username,
        } : null,
        ip: req.ip,
      };

      // Log assíncrono do erro
      setImmediate(async () => {
        try {
          console.error('🚨 Error logged:', errorLog);
          // TODO: Salvar erro no sistema de auditoria se necessário
        } catch (logError) {
          console.error('❌ Erro ao logar erro:', logError);
        }
      });
    }

    next(error);
  };
};

/**
 * Middleware para estatísticas em tempo real
 * Atualiza métricas de auditoria
 */
const auditStatsCollector = () => {
  return (req, res, next) => {
    const startTime = Date.now();

    // Coleta métricas quando a resposta for enviada
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const endpoint = req.originalUrl;
      const method = req.method;
      const status = res.statusCode;

      // Atualiza estatísticas de forma assíncrona
      setImmediate(() => {
        try {
          // TODO: Implementar collector de métricas se necessário
          if (process.env.NODE_ENV === 'development') {
            console.log(`📊 Stats: ${method} ${endpoint} - ${status} (${duration}ms)`);
          }
        } catch (error) {
          // Ignora erros de estatísticas
        }
      });
    });

    next();
  };
};

/**
 * Factory para criar middleware personalizado
 */
const createCustomAuditLogger = (customOptions) => {
  const defaultOptions = {
    includeBody: true,
    includeHeaders: true,
    includeQuery: true,
    includeParams: true,
    logLevel: 'INFO',
  };

  return auditLogger({ ...defaultOptions, ...customOptions });
};

module.exports = {
  auditLogger,
  auditAdminActions,
  auditAuthActions,
  auditCriticalActions,
  auditUserContext,
  auditErrorLogger,
  auditStatsCollector,
  createCustomAuditLogger,
};
