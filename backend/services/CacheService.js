const { redisHelpers, getRedisStatus } = require('../config/redis');

/**
 * 🚀 Cache Service Universal
 * Serviço de cache com fallback gracioso e estratégias inteligentes
 */
class CacheService {
    constructor() {
        this.enabled = process.env.REDIS_ENABLED !== 'false';
        this.defaultTTL = 300; // 5 minutos
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            errors: 0
        };
    }

    /**
     * 📊 Estatísticas do cache
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0
            ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
            : 0;

        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            redisStatus: getRedisStatus(),
            enabled: this.enabled
        };
    }

    /**
     * 🔑 Gera chave padronizada
     */
    generateKey(prefix, identifier, params = {}) {
        const baseKey = `${prefix}:${identifier}`;

        if (Object.keys(params).length === 0) {
            return baseKey;
        }

        // Ordena parâmetros para chave consistente
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');

        return `${baseKey}:${Buffer.from(sortedParams).toString('base64')}`;
    }

    /**
     * 📥 GET - Busca do cache
     */
    async get(key, options = {}) {
        if (!this.enabled) return null;

        try {
            const data = await redisHelpers.get(key);

            if (data !== null) {
                this.stats.hits++;
                console.log(`📦 Cache HIT: ${key}`);
                return data;
            } else {
                this.stats.misses++;
                console.log(`🔍 Cache MISS: ${key}`);
                return null;
            }
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ Cache GET error for ${key}:`, error.message);
            return null;
        }
    }

    /**
     * 📤 SET - Salva no cache
     */
    async set(key, data, ttl = null) {
        if (!this.enabled) return false;

        try {
            const cacheTTL = ttl || this.defaultTTL;
            const success = await redisHelpers.set(key, data, cacheTTL);

            if (success) {
                this.stats.sets++;
                console.log(`💾 Cache SET: ${key} (TTL: ${cacheTTL}s)`);
            }

            return success;
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ Cache SET error for ${key}:`, error.message);
            return false;
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
                console.log(`🗑️ Cache DELETE: ${key}`);
            }

            return deleted > 0;
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ Cache DELETE error for ${key}:`, error.message);
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
                console.log(`🧹 Cache INVALIDATE PATTERN: ${pattern} (${deleted} keys)`);
            }

            return deleted;
        } catch (error) {
            this.stats.errors++;
            console.error(`❌ Cache INVALIDATE error for ${pattern}:`, error.message);
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
            console.log(`⚡ Cache-aside: Fetching ${key}`);
            const data = await fetchFunction();

            // Salva no cache para próximas consultas
            if (data !== null && data !== undefined) {
                await this.set(key, data, ttl);
            }

            return data;
        } catch (error) {
            console.error(`❌ Cache-aside error for ${key}:`, error.message);
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
            console.error(`❌ Cache refresh error for ${key}:`, error.message);
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
            forceRefresh = false
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

        console.log(`🧹 Invalidated ${totalDeleted} related cache entries for ${entityType}`);
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
            'users': ['users:*', 'jwt:*']
        };

        return cascadePatterns[entityType] || basePatterns;
    }

    /**
     * 🏥 Health check
     */
    async healthCheck() {
        try {
            const testKey = 'health:check';
            const testValue = { timestamp: Date.now() };

            // Testa SET
            const setResult = await this.set(testKey, testValue, 10);

            // Testa GET
            const getValue = await this.get(testKey);

            // Testa DELETE
            const deleteResult = await this.delete(testKey);

            return {
                status: 'healthy',
                operations: {
                    set: setResult,
                    get: getValue !== null,
                    delete: deleteResult
                },
                stats: this.getStats()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                stats: this.getStats()
            };
        }
    }
}

// Instância singleton
const cacheService = new CacheService();

module.exports = cacheService;
