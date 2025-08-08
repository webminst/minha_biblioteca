const { redis, redisHelpers, getRedisStatus } = require('../config/redis');
const logger = require('../config/logger');

/**
 * 🚀 Cache Service Universal
 * Serviço de cache com fallback gracioso e estratégias inteligentes
 */
class CacheService {
  constructor() {
    this.enabled = process.env.REDIS_ENABLED !== 'false';
    this.defaultTTL = parseInt(process.env.CACHE_DEFAULT_TTL || '300', 10);
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      stale: 0,
      backgroundRefreshes: 0,
    };
    
    // Configuração de TTL por tipo de recurso (em segundos)
    this.ttlConfig = {
      'books-list': 300,        // 5 minutos
      'book-detail': 1800,      // 30 minutos
      'sermons-list': 300,      // 5 minutos
      'sermon-detail': 1800,    // 30 minutos
      'studies-list': 300,      // 5 minutos
      'study-detail': 1800,     // 30 minutos
      'home-latest': 60,        // 1 minuto
      'user-data': 900,         // 15 minutos
      'config': 3600,           // 1 hora
      'default': this.defaultTTL,
    };
    
    this.logPrefix = '[CacheService]';
  }

  /**
   * 📊 Obtém estatísticas detalhadas do cache
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 
      ? (this.stats.hits / total * 100).toFixed(2)
      : 0;
    
    const staleRate = this.stats.hits > 0
      ? (this.stats.stale / this.stats.hits * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      staleRate: `${staleRate}%`,
      redisStatus: getRedisStatus(),
      enabled: this.enabled,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      uptime: process.uptime(), // segundos
    };
  }

  /**
   * 🔑 Gera chave padronizada com hash consistente
   */
  generateKey(prefix, identifier, params = {}) {
    // Remove espaços e caracteres especiais do prefixo
    const safePrefix = String(prefix).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const baseKey = `${safePrefix}:${String(identifier)}`;

    if (Object.keys(params).length === 0) {
      return baseKey;
    }

    // Ordena e serializa parâmetros de forma consistente
    const serializedParams = Object.keys(params)
      .sort()
      .map(key => {
        const value = params[key];
        // Serializa valores de forma consistente
        const serialized = typeof value === 'object' 
          ? JSON.stringify(value) 
          : String(value);
        return `${key}=${serialized}`;
      })
      .join('&');

    // Usa hash para chaves muito longas
    if (serializedParams.length > 100) {
      const crypto = require('crypto');
      const hash = crypto.createHash('md5').update(serializedParams).digest('hex');
      return `${baseKey}:${hash}`;
    }
    
    return `${baseKey}:${Buffer.from(serializedParams).toString('base64url')}`;
  }

  /**
   * ⏱️ Obtém TTL apropriado para o tipo de dado
   */
  getTTL(type, customTTL) {
    if (customTTL !== undefined) return customTTL;
    return this.ttlConfig[type] || this.ttlConfig.default;
  }

  /**
   * 📥 GET - Busca do cache com suporte a dados obsoletos
   */
  async get(key, options = {}) {
    const { 
      type = 'default',
      staleTTL = 0, // Tempo extra para manter dados obsoletos
      ignoreStale = false, // Ignora dados obsoletos
    } = options;
    
    if (!this.enabled) return null;

    try {
      const cachedData = await redisHelpers.get(key);
      
      if (!cachedData) {
        this.stats.misses++;
        logger.debug(`${this.logPrefix} Cache miss for key: ${key}`);
        return null;
      }
      
      // Tenta extrair dados e timestamp
      let data, timestamp, ttl;
      try {
        const parsed = JSON.parse(cachedData);
        data = parsed.data;
        timestamp = parsed.timestamp || 0;
        ttl = parsed.ttl || this.getTTL(type);
      } catch (e) {
        // Formato antigo ou inválido, retorna como está
        logger.warn(`${this.logPrefix} Invalid cache format for key: ${key}`, { error: e.message });
        this.stats.hits++;
        return cachedData;
      }
      
      const now = Date.now();
      const age = (now - timestamp) / 1000; // em segundos
      const isStale = age > ttl;
      const isStaleButValid = isStale && age < (ttl + staleTTL);
      
      if (isStale) {
        if (!ignoreStale && isStaleButValid) {
          this.stats.stale++;
          this.stats.hits++;
          logger.debug(`${this.logPrefix} Returning stale data for key: ${key} (${Math.floor(age - ttl)}s stale)`);
          return data;
        }
        this.stats.misses++;
        logger.debug(`${this.logPrefix} Stale data expired for key: ${key}`);
        return null;
      }
      
      this.stats.hits++;
      logger.debug(`${this.logPrefix} Cache hit for key: ${key} (${Math.floor(ttl - age)}s remaining)`);
      return data;
      
    } catch (error) {
      this.stats.errors++;
      logger.error(`${this.logPrefix} Error getting key: ${key}`, { error: error.message });
      return null;
    }
  }

  /**
   * 📤 SET - Salva no cache com timestamp e metadados
   */
  async set(key, data, options = {}) {
    if (!this.enabled) return false;
    
    const { 
      ttl = null, 
      type = 'default',
      tags = [] 
    } = typeof options === 'number' ? { ttl: options } : options;
    
    const cacheTTL = ttl !== null ? ttl : this.getTTL(type);
    
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: cacheTTL,
        type,
        ...(tags.length > 0 && { tags }),
      };
      
      const success = await redisHelpers.set(key, JSON.stringify(cacheData), cacheTTL);
      
      if (success) {
        this.stats.sets++;
        logger.debug(`${this.logPrefix} Cache set for key: ${key} (TTL: ${cacheTTL}s)`);
        
        // Armazena referência de tags se fornecido
        if (tags.length > 0) {
          await this._storeTagReferences(key, tags);
        }
      }
      
      return success;
    } catch (error) {
      this.stats.errors++;
      logger.error(`${this.logPrefix} Error setting key: ${key}`, { 
        error: error.message,
        type,
        ttl: cacheTTL 
      });
      return false;
    }
  }
  
  /**
   * 🏷️ Armazena referências de tags para invalidação em lote
   */
  async _storeTagReferences(key, tags) {
    if (!Array.isArray(tags) || tags.length === 0) return;
    
    try {
      const pipeline = redis.redis.pipeline();
      const tagExpiration = this.getTTL('tag-references') * 2; // Tags expiram depois do dobro do TTL
      
      tags.forEach(tag => {
        const tagKey = `tag:${tag}`;
        pipeline.sadd(tagKey, key);
        pipeline.expire(tagKey, tagExpiration);
      });
      
      await pipeline.exec();
      logger.debug(`${this.logPrefix} Stored tag references for key: ${key}`, { tags });
    } catch (error) {
      logger.error(`${this.logPrefix} Error storing tag references`, { 
        error: error.message,
        key,
        tags 
      });
    }
  }
  
  /**
   * 🚫 Invalida todas as chaves com uma determinada tag
   */
  async invalidateByTag(tag) {
    if (!this.enabled) return 0;
    
    const tagKey = `tag:${tag}`;
    
    try {
      // Obtém todas as chaves com esta tag
      const keys = await redis.redis.smembers(tagKey);
      if (!keys || keys.length === 0) return 0;
      
      // Remove as chaves e a tag
      const pipeline = redis.redis.pipeline();
      keys.forEach(key => pipeline.del(key));
      pipeline.del(tagKey);
      
      const results = await pipeline.exec();
      const deletedCount = results.slice(0, -1).filter(r => r[1]).length;
      
      logger.info(`${this.logPrefix} Invalidated ${deletedCount} keys with tag: ${tag}`);
      return deletedCount;
      
    } catch (error) {
      logger.error(`${this.logPrefix} Error invalidating by tag: ${tag}`, { 
        error: error.message 
      });
      return 0;
    }
  }
  
  /**
   * 🔄 Obtém dados com cache, atualizando em segundo plano se necessário
   */
  async withCache(key, fetchFn, options = {}) {
    const { 
      type = 'default',
      ttl = null,
      staleTTL = 3600, // 1 hora para dados obsoletos por padrão
      backgroundRefresh = true,
      tags = [],
      ...restOptions 
    } = options;
    
    // Tenta obter do cache primeiro
    const cached = await this.get(key, { 
      type, 
      staleTTL,
      ...restOptions 
    });
    
    // Se encontrou no cache e não está obsoleto, retorna
    if (cached !== null) {
      const now = Date.now();
      const age = (now - (cached.timestamp || 0)) / 1000; // em segundos
      const isStale = age > (cached.ttl || this.getTTL(type));
      
      if (!isStale) {
        return cached.data;
      }
      
      // Se está obsoleto mas tem dados, inicia atualização em segundo plano
      if (backgroundRefresh) {
        this._refreshInBackground(key, fetchFn, { type, ttl, tags });
        return cached.data;
      }
    }
    
    // Se não tem cache ou está obsoleto sem background refresh, busca os dados
    try {
      const data = await fetchFn();
      if (data !== undefined && data !== null) {
        await this.set(key, data, { type, ttl, tags });
      }
      return data;
    } catch (error) {
      // Se falhar mas tiver cache obsoleto, retorna o cache
      if (cached !== null) {
        logger.warn(`${this.logPrefix} Using stale data after fetch error`, { 
          key, 
          error: error.message 
        });
        return cached.data;
      }
      throw error; // Propaga o erro se não tiver cache
    }
  }
  
  /**
   * 🔄 Atualiza o cache em segundo plano
   */
  async _refreshInBackground(key, fetchFn, options = {}) {
    try {
      const data = await fetchFn();
      if (data !== undefined && data !== null) {
        await this.set(key, data, options);
        this.stats.backgroundRefreshes++;
        logger.debug(`${this.logPrefix} Background refresh for key: ${key}`);
      }
    } catch (error) {
      logger.error(`${this.logPrefix} Background refresh failed for key: ${key}`, {
        error: error.message
      });
    }
  }
  
  /**
   * 🗑️ DELETE - Remove do cache
   */
  async delete(key) {
    if (!this.enabled) return false;

    try {
      const deleted = await redisHelpers.del(key);
      this.stats.deletes += deleted;

      if (deleted > 0) {
        logger.debug(`${this.logPrefix} Deleted key: ${key}`);
      }

      return deleted > 0;
    } catch (error) {
      this.stats.errors++;
      logger.error(`${this.logPrefix} Error deleting key: ${key}`, { error: error.message });
      return false;
    }
  }

  /**
   * 🧹 Invalidação por padrão
   */
  async invalidatePattern(pattern) {
    if (!this.enabled) return 0;

    try {
      const deleted = await redisHelpers.deletePattern(pattern);
      this.stats.deletes += deleted;

      if (deleted > 0) {
        logger.debug(`${this.logPrefix} Invalidated pattern: ${pattern} (${deleted} keys)`);
      }

      return deleted;
    } catch (error) {
      this.stats.errors++;
      logger.error(`${this.logPrefix} Error invalidating pattern: ${pattern}`, { error: error.message });
      return 0;
    }
  }

  /**
   * ⚡ Cache com callback (cache-aside pattern)
   */
  async getOrSet(key, fetchFunction, ttl = null) {
    // Tenta buscar do cache primeiro
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      // Cache miss - busca da fonte
      logger.debug(`${this.logPrefix} Cache miss for key: ${key}, fetching from source`);
      const data = await fetchFunction();

      // Salva no cache para próximas consultas
      if (data !== null && data !== undefined) {
        await this.set(key, data, ttl);
      }

      return data;
    } catch (error) {
      logger.error(`${this.logPrefix} Error in getOrSet for key: ${key}`, { 
        error: error.message 
      });
      throw error; // Re-propaga o erro original
    }
  }

  /**
   * 🔄 Refresh cache (força atualização)
   */
  async refresh(key, fetchFunction, ttl = null) {
    try {
      // Remove cache existente
      await this.delete(key);

      // Busca dados frescos
      const data = await fetchFunction();

      // Salva no cache
      if (data !== null && data !== undefined) {
        await this.set(key, data, ttl);
      }

      return data;
    } catch (error) {
      logger.error(`${this.logPrefix} Error refreshing cache for key: ${key}`, { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * 📋 Estratégias de TTL por tipo de conteúdo
   */
  getTTLForType(type, operation = 'read') {
    const strategies = {
      // Dados que mudam pouco
      'stats': 1800,        // 30 minutos
      'counters': 900,      // 15 minutos
      'config': 3600,       // 1 hora

      // Listas de conteúdo
      'books-list': 300,    // 5 minutos
      'sermons-list': 300,  // 5 minutos
      'studies-list': 300,  // 5 minutos

      // Itens individuais
      'book-detail': 600,   // 10 minutos
      'sermon-detail': 600, // 10 minutos
      'study-detail': 600,  // 10 minutos

      // Busca e filtros
      'search': 600,        // 10 minutos
      'suggestions': 1800,  // 30 minutos
      'filters': 1800,      // 30 minutos

      // Autenticação
      'jwt-session': 900,   // 15 minutos
      'user-profile': 600,  // 10 minutos

      // Home page
      'home-latest': 180,   // 3 minutos
      'home-featured': 300, // 5 minutos
    };

    return strategies[type] || this.defaultTTL;
  }

  /**
   * 🎯 Cache inteligente com auto-TTL
   */
  async smartCache(prefix, identifier, fetchFunction, options = {}) {
    const {
      params = {},
      type = 'default',
      forceRefresh = false,
    } = options;

    const key = this.generateKey(prefix, identifier, params);
    const ttl = this.getTTLForType(type);

    if (forceRefresh) {
      return this.refresh(key, fetchFunction, ttl);
    } else {
      return this.getOrSet(key, fetchFunction, ttl);
    }
  }

  /**
   * 🧹 Limpeza de cache relacionado
   */
  async invalidateRelated(entityType, operation = 'update') {
    const patterns = this.getInvalidationPatterns(entityType, operation);

    let totalDeleted = 0;
    for (const pattern of patterns) {
      const deleted = await this.invalidatePattern(pattern);
      totalDeleted += deleted;
    }

    logger.info(`${this.logPrefix} Invalidated ${totalDeleted} keys related to ${entityType} (${operation})`);
    return totalDeleted;
  }

  /**
   * 📋 Padrões de invalidação
   */
  getInvalidationPatterns(entityType, operation) {
    const basePatterns = [`${entityType}:*`];

    // Invalidação em cascata
    const cascadePatterns = {
      'books': ['books:*', 'stats:*', 'home:*'],
      'sermons': ['sermons:*', 'stats:*', 'home:*'],
      'studies': ['studies:*', 'stats:*', 'home:*'],
      'users': ['users:*', 'jwt:*'],
    };

    return cascadePatterns[entityType] || basePatterns;
  }

  /**
   * 🩺 Verifica a saúde do serviço de cache
   */
  async healthCheck() {
    try {
      const testKey = 'health:check';
      const testValue = { timestamp: Date.now() };
      
      // Testa escrita
      await this.set(testKey, testValue, 10);
      
      // Testa leitura
      const cached = await this.get(testKey);
      
      // Testa deleção
      await this.delete(testKey);
      
      return {
        status: 'healthy',
        redis: getRedisStatus(),
        stats: this.getStats(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        redis: getRedisStatus(),
        stats: this.getStats(),
      };
    }
  }
}

// Instância singleton
module.exports = new CacheService();
