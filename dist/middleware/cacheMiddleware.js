"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheMiddleware = void 0;
const CacheService_1 = __importDefault(require("../services/CacheService"));
function generateDefaultKey(req, includeHeaders, excludeParams) {
    // Exemplo simples: pode ser expandido conforme necessário
    let key = req.originalUrl;
    if (includeHeaders.length > 0) {
        key += '|' + includeHeaders.map(h => req.headers[h] || '').join('|');
    }
    if (excludeParams.length > 0 && req.query) {
        const filtered = Object.entries(req.query)
            .filter(([k]) => !excludeParams.includes(k))
            .map(([k, v]) => `${k}=${v}`)
            .join('&');
        key += '|' + filtered;
    }
    return key;
}
const cacheMiddleware = (options = {}) => {
    const { ttl = 300, keyGenerator = null, condition = null, skipCache = false, cacheType = 'default', onlyMethods = ['GET'], includeHeaders = [], excludeParams = ['_', 'timestamp', 'nocache'] } = options;
    return async (req, res, next) => {
        try {
            if (skipCache || !onlyMethods.includes(req.method)) {
                return next();
            }
            if (condition && !condition(req)) {
                return next();
            }
            if (req.query && req.query.nocache === 'true') {
                return next();
            }
            const cacheKey = keyGenerator
                ? keyGenerator(req)
                : generateDefaultKey(req, includeHeaders, excludeParams);
            console.log(`🔍 Checking cache for: ${cacheKey}`);
            const cached = await CacheService_1.default.get(cacheKey);
            if (cached !== null) {
                console.log(`📦 Cache HIT: ${cacheKey}`);
                res.set('X-Cache', 'HIT');
                res.set('X-Cache-Key', cacheKey);
                return res.json(cached);
            }
            console.log(`🔍 Cache MISS: ${cacheKey}`);
            const originalJson = res.json;
            res.json = function (data) {
                if (res.statusCode === 200 && data) {
                    const cacheTTL = CacheService_1.default.getTTLForType ? CacheService_1.default.getTTLForType(cacheType) : ttl;
                    const finalTTL = ttl || cacheTTL;
                    CacheService_1.default.set(cacheKey, data, finalTTL)
                        .then(() => {
                        console.log(`💾 Cache SET: ${cacheKey} (TTL: ${finalTTL}s)`);
                    })
                        .catch((err) => {
                        console.error('❌ Cache save error:', err.message);
                    });
                }
                res.set('X-Cache', 'MISS');
                res.set('X-Cache-Key', cacheKey);
                return originalJson.call(this, data);
            };
            next();
        }
        catch (err) {
            console.error('Erro no middleware de cache:', err);
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
