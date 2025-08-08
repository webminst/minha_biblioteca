const Redis = require('ioredis');
const { promisify } = require('util');
const logger = require('./logger');

// Configurações do Redis com opções avançadas
const redisConfig = {
  // Configurações básicas
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB, 10) || 0,
  
  // Configurações de reconexão
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 5000); // Aumenta o delay a cada tentativa, até 5s
    logger.warn(`Tentativa ${times} de reconexão ao Redis em ${delay}ms`);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Reconecta quando o nó é apenas de leitura
    }
    return false;
  },
  
  // Timeouts
  connectTimeout: 10000, // 10 segundos para conectar
  commandTimeout: 10000, // 10 segundos para comandos
  
  // Alta disponibilidade
  enableOfflineQueue: true, // Permite enfileirar comandos quando offline
  maxRetriesPerRequest: 5, // Aumenta o número de tentativas
  
  // Desempenho
  keepAlive: 60000, // 1 minuto de keepalive
  family: 4, // IPv4
  
  // Depuração
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
  enableReadyCheck: true, // Verifica se o Redis está pronto
  autoResubscribe: true, // Reconecta as subscrições
  autoResendUnfulfilledCommands: true, // Reenvia comandos não concluídos
  
  // Prefixo para todas as chaves
  keyPrefix: process.env.REDIS_PREFIX || 'pastor-portfolio:',
  
  // TLS/SSL (opcional)
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
};

// Instância principal do Redis
const redis = new Redis(redisConfig);

// Status de conexão
let isConnected = false;
let connectionError = null;

// Eventos de conexão
redis.on('connect', () => {
  console.log('🔗 Conectando ao Redis...');
});

redis.on('ready', () => {
  isConnected = true;
  connectionError = null;
  console.log('✅ Redis conectado com sucesso!');
  console.log(`📍 Host: ${redisConfig.host}:${redisConfig.port}`);
  console.log(`🗄️  Database: ${redisConfig.db}`);
});

redis.on('error', (err) => {
  isConnected = false;
  connectionError = err;
  console.error('❌ Erro na conexão Redis:', err.message);
});

redis.on('close', () => {
  isConnected = false;
  console.log('🔌 Conexão Redis fechada');
});

redis.on('reconnecting', (delay) => {
  console.log(`🔄 Tentando reconectar ao Redis em ${delay}ms...`);
});

// Helper para verificar status
const getRedisStatus = () => ({
  connected: isConnected,
  error: connectionError?.message || null,
  config: {
    host: redisConfig.host,
    port: redisConfig.port,
    db: redisConfig.db,
  },
});

// Helper para operações seguras
const safeRedisOperation = async (operation, fallback = null) => {
  try {
    if (!isConnected) {
      console.warn('⚠️ Redis não conectado, usando fallback');
      return fallback;
    }
    return await operation();
  } catch (error) {
    console.error('❌ Erro na operação Redis:', error.message);
    return fallback;
  }
};

// Wrapper para operações comuns
const redisHelpers = {
  // GET com fallback
  async get(key, fallback = null) {
    return safeRedisOperation(async () => {
      const result = await redis.get(key);
      return result ? JSON.parse(result) : fallback;
    }, fallback);
  },

  // SET com TTL
  async set(key, value, ttl = 300) {
    return safeRedisOperation(async () => {
      const serialized = JSON.stringify(value);
      if (ttl > 0) {
        return await redis.setex(key, ttl, serialized);
      } else {
        return await redis.set(key, serialized);
      }
    }, false);
  },

  // DELETE
  async del(key) {
    return safeRedisOperation(async () => {
      return await redis.del(key);
    }, 0);
  },

  // EXISTS
  async exists(key) {
    return safeRedisOperation(async () => {
      return await redis.exists(key) === 1;
    }, false);
  },

  // KEYS pattern
  async keys(pattern) {
    return safeRedisOperation(async () => {
      return await redis.keys(pattern);
    }, []);
  },

  // DELETE por pattern
  async deletePattern(pattern) {
    return safeRedisOperation(async () => {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        return await redis.del(keys);
      }
      return 0;
    }, 0);
  },

  // TTL
  async ttl(key) {
    return safeRedisOperation(async () => {
      return await redis.ttl(key);
    }, -1);
  },

  // EXPIRE
  async expire(key, seconds) {
    return safeRedisOperation(async () => {
      return await redis.expire(key, seconds);
    }, false);
  },

  // Incrementar contador
  async incr(key, ttl = 3600) {
    return safeRedisOperation(async () => {
      const result = await redis.incr(key);
      if (result === 1 && ttl > 0) {
        await redis.expire(key, ttl);
      }
      return result;
    }, 1);
  },

  // Estatísticas básicas
  async getStats() {
    return safeRedisOperation(async () => {
      const info = await redis.info('memory');
      const keyspace = await redis.info('keyspace');
      const keys = await redis.dbsize();

      return {
        connected: isConnected,
        totalKeys: keys,
        memoryUsed: info.match(/used_memory_human:(.+)/)?.[1]?.trim(),
        memoryPeak: info.match(/used_memory_peak_human:(.+)/)?.[1]?.trim(),
        keyspace,
      };
    }, {
      connected: false,
      totalKeys: 0,
      memoryUsed: 'N/A',
      memoryPeak: 'N/A',
      keyspace: '',
    });
  },
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Fechando conexão Redis...');
  await redis.disconnect();
});

process.on('SIGINT', async () => {
  console.log('🛑 Fechando conexão Redis...');
  await redis.disconnect();
});

// Função para verificar se Redis está conectado
const isRedisConnected = () => {
  return isConnected;
};

module.exports = {
  redis,
  redisHelpers,
  getRedisStatus,
  safeRedisOperation,
  isRedisConnected,
};
