/**
 * Configuração centralizada da aplicação
 * Centraliza todas as configurações do backend
 */

require('dotenv').config();

const config = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  },

  // Configurações do banco de dados
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pastor-portfolio',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // Configurações do Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: process.env.REDIS_DB || 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  },

  // Configurações de autenticação
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  },

  // Configurações de segurança
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // limite por IP
      message: 'Muitas requisições deste IP, tente novamente mais tarde.',
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ['\'self\''],
          styleSrc: ['\'self\'', '\'unsafe-inline\''],
          scriptSrc: ['\'self\''],
          imgSrc: ['\'self\'', 'data:', 'https:'],
        },
      },
    },
  },

  // Configurações de cache
  cache: {
    ttl: {
      default: 300, // 5 minutos
      stats: 600,   // 10 minutos
      list: 300,    // 5 minutos
      filter: 180,  // 3 minutos
      suggestions: 120, // 2 minutos
    },
    prefix: 'pastor-portfolio:',
  },

  // Configurações de auditoria
  audit: {
    enabled: process.env.AUDIT_ENABLED === 'true' || true,
    logLevel: process.env.AUDIT_LOG_LEVEL || 'info',
    retention: {
      days: parseInt(process.env.AUDIT_RETENTION_DAYS) || 90,
    },
  },

  // Configurações de logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'dev',
    file: process.env.LOG_FILE || null,
  },

  // Configurações de API
  api: {
    version: '3.0.0',
    basePath: '/api',
    swagger: {
      enabled: process.env.SWAGGER_ENABLED !== 'false',
      path: '/api-docs',
    },
  },

  // Configurações de 2FA
  twoFactor: {
    issuer: process.env.TWO_FACTOR_ISSUER || 'Pastor Portfolio',
    algorithm: 'sha1',
    digits: 6,
    period: 30,
  },
};

// Validação de configurações obrigatórias
const validateConfig = () => {
  const required = [
    'database.uri',
    'auth.jwtSecret',
  ];

  const missing = required.filter(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    return !value;
  });

  if (missing.length > 0) {
    throw new Error(`Configurações obrigatórias ausentes: ${missing.join(', ')}`);
  }
};

// Valida configurações em produção
if (config.server.nodeEnv === 'production') {
  validateConfig();
}

module.exports = config;
