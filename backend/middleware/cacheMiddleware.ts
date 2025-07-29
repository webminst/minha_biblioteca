import cacheService from '../services/CacheService';
import { Request, Response, NextFunction } from 'express';

/**
 * 🚀 Middleware de Cache Automático para Rotas
 * Cache inteligente baseado na URL e parâmetros da requisição
 */

interface CacheOptions {
    ttl?: number;
    keyGenerator?: (req: Request) => string;
    condition?: (req: Request) => boolean;
    skipCache?: boolean;
    cacheType?: string;
    onlyMethods?: string[];
    includeHeaders?: string[];
    excludeParams?: string[];
}

function generateDefaultKey(req: Request, includeHeaders: string[], excludeParams: string[]): string {
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

export const cacheMiddleware = (options: CacheOptions = {}) => {
    const {
        ttl = 300,
        keyGenerator = null,
        condition = null,
        skipCache = false,
        cacheType = 'default',
        onlyMethods = ['GET'],
        includeHeaders = [],
        excludeParams = ['_', 'timestamp', 'nocache']
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (skipCache || !onlyMethods.includes(req.method)) {
                return next();
            }
            if (condition && !condition(req)) {
                return next();
            }
            if (req.query && (req.query as any).nocache === 'true') {
                return next();
            }
            const cacheKey = keyGenerator
                ? keyGenerator(req)
                : generateDefaultKey(req, includeHeaders, excludeParams);
            console.log(`🔍 Checking cache for: ${cacheKey}`);
            const cached = await cacheService.get(cacheKey);
            if (cached !== null) {
                console.log(`📦 Cache HIT: ${cacheKey}`);
                res.set('X-Cache', 'HIT');
                res.set('X-Cache-Key', cacheKey);
                return res.json(cached);
            }
            console.log(`🔍 Cache MISS: ${cacheKey}`);
            const originalJson = res.json;
            res.json = function (data: any) {
                if (res.statusCode === 200 && data) {
                    const cacheTTL = cacheService.getTTLForType ? cacheService.getTTLForType(cacheType) : ttl;
                    const finalTTL = ttl || cacheTTL;
                    cacheService.set(cacheKey, data, finalTTL)
                        .then(() => {
                            console.log(`💾 Cache SET: ${cacheKey} (TTL: ${finalTTL}s)`);
                        })
                        .catch((err: any) => {
                            console.error('❌ Cache save error:', err.message);
                        });
                }
                res.set('X-Cache', 'MISS');
                res.set('X-Cache-Key', cacheKey);
                return originalJson.call(this, data);
            };
            next();
        } catch (err) {
            console.error('Erro no middleware de cache:', err);
            next();
        }
    };
};
