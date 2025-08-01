// middleware/rateLimiter.js
const { redis, getRedisStatus, isRedisConnected } = require('../config/redis');
const {
  RATE_LIMIT_CONFIG,
  TRUSTED_NETWORKS,
  REDIS_KEYS,
  getMessage,
  ACTIVE_PROFILE,
} = require('../config/rateLimitConfig');

/**
 * Classe para gerenciar Rate Limiting com Redis
 */
class RateLimiter {
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
  generateKey(type, ip, suffix = '') {
    const prefix = REDIS_KEYS[`${type.toUpperCase()}_ATTEMPTS`] || REDIS_KEYS[type.toUpperCase()];
    return `${prefix}${ip}${suffix ? `:${suffix}` : ''}`;
  }

  /**
     * Registra tentativa de acesso no Redis
     */
  async recordAttempt(ip, type = 'LOGIN') {
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
        return this.recordAttemptFallback(ip, type);
      }
    } else {
      return this.recordAttemptFallback(ip, type);
    }
  }

  /**
     * Fallback para armazenamento em memória
     */
  recordAttemptFallback(ip, type) {
    const key = `${type}:${ip}`;
    const now = Date.now();
    const config = RATE_LIMIT_CONFIG[type];

    if (!this.fallbackStore.has(key)) {
      this.fallbackStore.set(key, []);
    }

    const attempts = this.fallbackStore.get(key);
    const recentAttempts = attempts.filter(timestamp => now - timestamp < config.WINDOW_MS);

    recentAttempts.push(now);
    this.fallbackStore.set(key, recentAttempts);

    return recentAttempts.length;
  }

  /**
     * Obtém número de tentativas atuais
     */
  async getAttempts(ip, type = 'LOGIN') {
    const key = this.generateKey(type, ip);

    if (isRedisConnected()) {
      try {
        const attempts = await redis.get(key);
        return parseInt(attempts) || 0;
      } catch (error) {
        console.error('Erro ao obter tentativas do Redis:', error);
        return this.getAttemptsFallback(ip, type);
      }
    } else {
      return this.getAttemptsFallback(ip, type);
    }
  }

  /**
     * Fallback para obter tentativas da memória
     */
  getAttemptsFallback(ip, type) {
    const key = `${type}:${ip}`;
    const config = RATE_LIMIT_CONFIG[type];
    const now = Date.now();

    if (!this.fallbackStore.has(key)) {
      return 0;
    }

    const attempts = this.fallbackStore.get(key);
    const recentAttempts = attempts.filter(timestamp => now - timestamp < config.WINDOW_MS);
    this.fallbackStore.set(key, recentAttempts);

    return recentAttempts.length;
  }

  /**
     * Bloqueia IP temporariamente
     */
  async blockIP(ip, duration, reason = 'Rate limit exceeded') {
    const key = this.generateKey('BLOCKED', ip);

    if (isRedisConnected()) {
      try {
        await redis.setex(key, duration, JSON.stringify({
          blockedAt: Date.now(),
          reason,
          duration,
        }));

        // Log de segurança
        await this.logSecurityEvent(ip, 'IP_BLOCKED', { reason, duration });

        return true;
      } catch (error) {
        console.error('Erro ao bloquear IP no Redis:', error);
        return false;
      }
    }

    return false;
  }

  /**
     * Verifica se IP está bloqueado
     */
  async isIPBlocked(ip) {
    const key = this.generateKey('BLOCKED', ip);

    if (isRedisConnected()) {
      try {
        const blocked = await redis.get(key);
        return blocked !== null;
      } catch (error) {
        console.error('Erro ao verificar bloqueio no Redis:', error);
        return false;
      }
    }

    return false;
  }

  /**
     * Remove tentativas após sucesso no login
     */
  async clearAttempts(ip, type = 'LOGIN') {
    const key = this.generateKey(type, ip);

    if (isRedisConnected()) {
      try {
        await redis.del(key);
        await this.logSecurityEvent(ip, 'LOGIN_SUCCESS', { cleared: true });
      } catch (error) {
        console.error('Erro ao limpar tentativas no Redis:', error);
      }
    } else {
      const fallbackKey = `${type}:${ip}`;
      this.fallbackStore.delete(fallbackKey);
    }
  }

  /**
     * Registra eventos de segurança
     */
  async logSecurityEvent(ip, event, data = {}) {
    if (!isRedisConnected()) return;

    try {
      const logKey = REDIS_KEYS.SECURITY_LOG + Date.now();
      const logData = {
        timestamp: Date.now(),
        ip,
        event,
        data,
        userAgent: data.userAgent || 'unknown',
        profile: ACTIVE_PROFILE,
      };

      await redis.setex(logKey, 24 * 60 * 60, JSON.stringify(logData)); // 24 horas

      // Log no console para desenvolvimento
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔐 Security Event: ${event} from ${ip}`);
      }
    } catch (error) {
      console.error('Erro ao registrar log de segurança:', error);
    }
  }

  /**
     * Calcula delay progressivo baseado no número de tentativas
     */
  calculateProgressiveDelay(attempts) {
    if (attempts <= 3) return 0;
    if (attempts <= 5) return 2000; // 2 segundos
    if (attempts <= 7) return 5000; // 5 segundos
    return 10000; // 10 segundos
  }
}

// Instância singleton
const rateLimiter = new RateLimiter();

/**
 * Middleware de Rate Limiting para Login
 */
function loginRateLimit(req, res, next) {
  return rateLimitMiddleware('LOGIN')(req, res, next);
}

/**
 * Middleware de Rate Limiting para Auth geral
 */
function authRateLimit(req, res, next) {
  return rateLimitMiddleware('AUTH')(req, res, next);
}

/**
 * Middleware genérico de Rate Limiting
 */
function rateLimitMiddleware(type = 'LOGIN') {
  return async (req, res, next) => {
    try {
      const ip = rateLimiter.getClientIP(req);
      const config = RATE_LIMIT_CONFIG[type];

      // Bypass para IPs confiáveis
      if (rateLimiter.isTrustedIP(ip)) {
        console.log(`🔓 IP confiável bypass: ${ip}`);
        return next();
      }

      // Verifica se IP está bloqueado
      const isBlocked = await rateLimiter.isIPBlocked(ip);
      if (isBlocked) {
        await rateLimiter.logSecurityEvent(ip, 'BLOCKED_ACCESS_ATTEMPT', {
          userAgent: req.get('User-Agent'),
          path: req.path,
        });

        return res.status(429).json({
          success: false,
          message: getMessage('IP_BLOCKED'),
          code: 'IP_BLOCKED',
          retryAfter: config.BLOCK_DURATION,
        });
      }

      // Obtém tentativas atuais
      const currentAttempts = await rateLimiter.getAttempts(ip, type);

      // Verifica se excedeu o limite
      if (currentAttempts >= config.MAX_ATTEMPTS) {
        // Bloqueia IP por mais tempo
        await rateLimiter.blockIP(ip, config.BLOCK_DURATION, `Exceeded ${config.MAX_ATTEMPTS} attempts`);

        return res.status(429).json({
          success: false,
          message: getMessage('RATE_LIMIT_EXCEEDED'),
          code: 'RATE_LIMIT_EXCEEDED',
          maxAttempts: config.MAX_ATTEMPTS,
          retryAfter: config.BLOCK_DURATION,
          attemptsRemaining: 0,
        });
      }

      // Aplica delay progressivo se configurado
      if (config.PROGRESSIVE_DELAY && currentAttempts > 2) {
        const delay = rateLimiter.calculateProgressiveDelay(currentAttempts);
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      // Adiciona informações ao request
      req.rateLimitInfo = {
        attempts: currentAttempts,
        maxAttempts: config.MAX_ATTEMPTS,
        attemptsRemaining: config.MAX_ATTEMPTS - currentAttempts,
        type,
      };

      next();
    } catch (error) {
      console.error('Erro no rate limiting:', error);
      // Em caso de erro, permite o acesso mas registra o problema
      next();
    }
  };
}

/**
 * Middleware para registrar tentativa (usar APÓS validação)
 */
function recordAttemptMiddleware(type = 'LOGIN') {
  return async (req, res, next) => {
    const ip = rateLimiter.getClientIP(req);

    if (!rateLimiter.isTrustedIP(ip)) {
      await rateLimiter.recordAttempt(ip, type);

      // Log da tentativa
      await rateLimiter.logSecurityEvent(ip, `${type}_ATTEMPT`, {
        userAgent: req.get('User-Agent'),
        path: req.path,
        timestamp: Date.now(),
      });
    }

    next();
  };
}

/**
 * Middleware para limpar tentativas após sucesso
 */
function clearAttemptsMiddleware(type = 'LOGIN') {
  return async (req, res, next) => {
    const ip = rateLimiter.getClientIP(req);

    if (!rateLimiter.isTrustedIP(ip)) {
      await rateLimiter.clearAttempts(ip, type);
    }

    next();
  };
}

module.exports = {
  rateLimiter,
  loginRateLimit,
  authRateLimit,
  rateLimitMiddleware,
  recordAttemptMiddleware,
  clearAttemptsMiddleware,
  RATE_LIMIT_CONFIG,
};
