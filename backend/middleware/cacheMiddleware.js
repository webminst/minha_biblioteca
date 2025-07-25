const cacheService = require('../services/CacheService');

/**
 * 🚀 Middleware de Cache Automático para Rotas
 * Cache inteligente baseado na URL e parâmetros da requisição
 */

/**
 * Middleware principal de cache
 */
const cacheMiddleware = (options = {}) => {
    const {
        ttl = 300,                    // TTL padrão: 5 minutos
        keyGenerator = null,          // Função customizada para gerar chave
        condition = null,             // Condição para aplicar cache
        skipCache = false,            // Flag para pular cache
        cacheType = 'default',        // Tipo de cache para TTL inteligente
        onlyMethods = ['GET'],        // Métodos HTTP que usam cache
        includeHeaders = [],          // Headers a incluir na chave
        excludeParams = ['_', 'timestamp', 'nocache'] // Parâmetros a excluir da chave
    } = options;

    return async (req, res, next) => {
        try {
            // Verifica se deve aplicar cache
            if (skipCache || !onlyMethods.includes(req.method)) {
                return next();
            }

            // Verifica condição customizada
            if (condition && !condition(req)) {
                return next();
            }

            // Parâmetro especial para pular cache
            if (req.query.nocache === 'true') {
                return next();
            }

            // Gera chave do cache
            const cacheKey = keyGenerator
                ? keyGenerator(req)
                : generateDefaultKey(req, includeHeaders, excludeParams);

            console.log(`🔍 Checking cache for: ${cacheKey}`);

            // Tenta buscar do cache
            const cached = await cacheService.get(cacheKey);
            if (cached !== null) {
                console.log(`📦 Cache HIT: ${cacheKey}`);

                // Adiciona headers de cache
                res.set('X-Cache', 'HIT');
                res.set('X-Cache-Key', cacheKey);

                return res.json(cached);
            }

            console.log(`🔍 Cache MISS: ${cacheKey}`);

            // Intercepta a resposta para cachear
            const originalJson = res.json;
            const originalSend = res.send;

            res.json = function (data) {
                // Salva no cache apenas se status 200
                if (res.statusCode === 200 && data) {
                    const cacheTTL = cacheService.getTTLForType(cacheType);
                    const finalTTL = ttl || cacheTTL;

                    cacheService.set(cacheKey, data, finalTTL)
                        .then(() => {
                            console.log(`💾 Cache SET: ${cacheKey} (TTL: ${finalTTL}s)`);
                        })
                        .catch(err => {
                            console.error('❌ Cache save error:', err.message);
                        });
                }

                // Adiciona headers de cache
                res.set('X-Cache', 'MISS');
                res.set('X-Cache-Key', cacheKey);

                return originalJson.call(this, data);
            };

            // Também intercepta res.send para compatibilidade
            res.send = function (data) {
                if (res.statusCode === 200 && data && typeof data === 'string') {
                    try {
                        const parsed = JSON.parse(data);
                        const cacheTTL = cacheService.getTTLForType(cacheType);
                        const finalTTL = ttl || cacheTTL;

                        cacheService.set(cacheKey, parsed, finalTTL)
                            .catch(err => console.error('Cache save error:', err.message));
                    } catch (e) {
                        // Não é JSON, ignora
                    }
                }

                res.set('X-Cache', 'MISS');
                res.set('X-Cache-Key', cacheKey);

                return originalSend.call(this, data);
            };

            next();
        } catch (error) {
            console.error('❌ Cache middleware error:', error.message);
            next(); // Continua sem cache em caso de erro
        }
    };
};

/**
 * Gera chave padrão baseada na requisição
 */
function generateDefaultKey(req, includeHeaders = [], excludeParams = []) {
    const baseUrl = req.originalUrl.split('?')[0];

    // Parâmetros da query (excluindo os desnecessários)
    const filteredQuery = Object.keys(req.query)
        .filter(key => !excludeParams.includes(key))
        .sort()
        .reduce((obj, key) => {
            obj[key] = req.query[key];
            return obj;
        }, {});

    // Headers relevantes
    const relevantHeaders = includeHeaders.reduce((obj, header) => {
        if (req.headers[header]) {
            obj[header] = req.headers[header];
        }
        return obj;
    }, {});

    // Monta chave única
    const keyData = {
        url: baseUrl,
        query: filteredQuery,
        headers: relevantHeaders
    };

    const keyString = JSON.stringify(keyData);
    const keyHash = require('crypto')
        .createHash('md5')
        .update(keyString)
        .digest('hex')
        .substring(0, 8);

    return `route:${baseUrl.replace(/\//g, ':')}:${keyHash}`;
}

/**
 * Middleware específico para diferentes tipos de conteúdo
 */
const cacheStrategies = {

    // Cache para listas de conteúdo
    contentList: (entityType) => cacheMiddleware({
        cacheType: `${entityType}-list`,
        ttl: 300, // 5 minutos
        keyGenerator: (req) => {
            const params = { ...req.query };
            delete params.nocache;
            return cacheService.generateKey(entityType, 'list', params);
        }
    }),

    // Cache para detalhes de item
    contentDetail: (entityType) => cacheMiddleware({
        cacheType: `${entityType}-detail`,
        ttl: 600, // 10 minutos
        keyGenerator: (req) => {
            return cacheService.generateKey(entityType, req.params.id);
        }
    }),

    // Cache para estatísticas
    stats: () => cacheMiddleware({
        cacheType: 'stats',
        ttl: 1800, // 30 minutos
        keyGenerator: (req) => {
            return cacheService.generateKey('stats', req.originalUrl);
        }
    }),

    // Cache para busca
    search: (entityType) => cacheMiddleware({
        cacheType: 'search',
        ttl: 600, // 10 minutos
        keyGenerator: (req) => {
            const searchParams = { ...req.query };
            delete searchParams.nocache;
            return cacheService.generateKey(`${entityType}`, 'search', searchParams);
        }
    }),

    // Cache para dados da home
    home: () => cacheMiddleware({
        cacheType: 'home-latest',
        ttl: 180, // 3 minutos
        keyGenerator: (req) => {
            return cacheService.generateKey('home', req.originalUrl.replace(/\//g, ':'));
        }
    }),

    // Cache para filtros
    filters: (entityType) => cacheMiddleware({
        cacheType: 'filters',
        ttl: 1800, // 30 minutos
        keyGenerator: (req) => {
            return cacheService.generateKey(`${entityType}`, 'filters', req.query);
        }
    }),
    
    // Cache para sugestões
    suggestions: (entityType) => cacheMiddleware({
        cacheType: 'suggestions',
        ttl: 300, // 5 minutos
        keyGenerator: (req) => {
            const searchParams = { ...req.query };
            delete searchParams.nocache;
            return cacheService.generateKey(`${entityType}`, 'suggestions', searchParams);
        }
    })
};

/**
 * Middleware para invalidar cache após operações de escrita
 */
const invalidateCacheMiddleware = (entityType, operation = 'update') => {
    return async (req, res, next) => {
        // Executa a operação original
        const originalJson = res.json;

        res.json = function (data) {
            // Se a operação foi bem-sucedida, invalida caches
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cacheService.invalidateRelated(entityType, operation)
                    .then(deletedCount => {
                        console.log(`🧹 Invalidated ${deletedCount} cache entries for ${entityType}:${operation}`);
                    })
                    .catch(err => {
                        console.error('❌ Cache invalidation error:', err.message);
                    });
            }

            return originalJson.call(this, data);
        };

        next();
    };
};

/**
 * Helper para condições de cache
 */
const cacheConditions = {
    // Só faz cache para usuários autenticados
    authenticated: (req) => !!req.user,

    // Só faz cache para usuários não autenticados
    anonymous: (req) => !req.user,

    // Só faz cache se não tem parâmetros de busca
    noSearch: (req) => !req.query.search,

    // Só faz cache para primeiro página
    firstPage: (req) => !req.query.page || req.query.page === '1',

    // Só faz cache para requests com Accept: application/json
    jsonOnly: (req) => req.headers.accept?.includes('application/json')
};

/**
 * Middleware para warm-up de cache
 */
const warmUpMiddleware = (warmUpFunction) => {
    return async (req, res, next) => {
        // Executa warm-up em background (não bloqueia request)
        warmUpFunction()
            .catch(err => console.error('❌ Cache warm-up error:', err.message));

        next();
    };
};

/**
 * Middleware para estatísticas de cache
 */
const cacheStatsMiddleware = () => {
    return (req, res, next) => {
        // Adiciona endpoint para estatísticas
        if (req.path === '/cache/stats' && req.method === 'GET') {
            const stats = cacheService.getStats();
            return res.json({
                success: true,
                data: stats,
                timestamp: new Date()
            });
        }

        // Adiciona endpoint para health check
        if (req.path === '/cache/health' && req.method === 'GET') {
            cacheService.healthCheck()
                .then(health => res.json({ success: true, data: health }))
                .catch(error => res.status(500).json({
                    success: false,
                    error: error.message
                }));
            return;
        }

        next();
    };
};

module.exports = {
    cacheMiddleware,
    cacheStrategies,
    invalidateCacheMiddleware,
    cacheConditions,
    warmUpMiddleware,
    cacheStatsMiddleware,
    generateDefaultKey
};
