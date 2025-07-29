"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../config/redis");
/**
 * 🚀 Cache Service Universal
 * Serviço de cache com fallback gracioso e estratégias inteligentes
 */
class CacheService {
    constructor() {
        this.enabled = process.env.REDIS_ENABLED !== 'false';
        this.defaultTTL = 300;
        this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0, errors: 0 };
    }
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0
            ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
            : 0;
        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            redisStatus: (0, redis_1.getRedisStatus)(),
            enabled: this.enabled
        };
    }
    generateKey(prefix, identifier, params = {}) {
        const baseKey = `${prefix}:${identifier}`;
        if (Object.keys(params).length === 0)
            return baseKey;
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return `${baseKey}:${Buffer.from(sortedParams).toString('base64')}`;
    }
    async get(key, options = {}) {
        if (!this.enabled)
            return null;
        // ...implementar lógica de get usando redisHelpers...
        return null;
    }
}
exports.default = new CacheService();
