// backend/services/CachedSermonService.js
const SermonService = require('./SermonService');
const CacheService = require('./CacheService');

/**
 * Wrapper do SermonService com funcionalidades de cache
 * Mantém toda a interface original do SermonService
 */
class CachedSermonService {
    constructor() {
        this.sermonService = SermonService;
        this.cacheService = CacheService;
        this.cachePrefix = 'sermon';
    }

    /**
     * Busca todos os sermões com cache
     */
    async findAll(options = {}) {
        const cacheKey = `${this.cachePrefix}:list`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.sermonService.findAll(options),
            this.cacheService.getTTLForType('list')
        );
    }

    /**
     * Busca sermão por ID com cache
     */
    async findById(id) {
        const cacheKey = `${this.cachePrefix}:detail:${id}`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.sermonService.findById(id),
            this.cacheService.getTTLForType('detail')
        );
    }

    /**
     * Busca último sermão com cache
     */
    async findLatest() {
        const cacheKey = `${this.cachePrefix}:latest`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.sermonService.findLatest(),
            this.cacheService.getTTLForType('stats')
        );
    }

    /**
     * Cria novo sermão e invalida cache relevante
     */
    async create(sermonData, userId) {
        const result = await this.sermonService.create(sermonData, userId);

        // Invalida caches relacionados
        await Promise.all([
            this.cacheService.invalidatePattern(`${this.cachePrefix}:list*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:stats*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:latest*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:series*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:speakers*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:books*`)
        ]);

        console.log('🗑️ Cache invalidado após criação de sermão');
        return result;
    }

    /**
     * Atualiza sermão e invalida cache relevante
     */
    async update(id, updateData, userId) {
        const result = await this.sermonService.update(id, updateData, userId);

        // Invalida caches relacionados
        await Promise.all([
            this.cacheService.invalidatePattern(`${this.cachePrefix}:detail:${id}`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:list*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:stats*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:latest*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:series*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:speakers*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:books*`)
        ]);

        console.log(`🗑️ Cache invalidado após atualização do sermão ${id}`);
        return result;
    }

    /**
     * Exclui sermão e invalida cache relevante
     */
    async delete(id) {
        const result = await this.sermonService.delete(id);

        // Invalida caches relacionados
        await Promise.all([
            this.cacheService.invalidatePattern(`${this.cachePrefix}:detail:${id}`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:list*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:stats*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:latest*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:series*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:speakers*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:books*`)
        ]);

        console.log(`🗑️ Cache invalidado após exclusão do sermão ${id}`);
        return result;
    }

    /**
     * Busca sermões por série com cache
     */
    async findBySeries(series) {
        const cacheKey = `${this.cachePrefix}:series:${series}`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.sermonService.findBySeries(series),
            this.cacheService.getTTLForType('filter')
        );
    }

    /**
     * Busca sermões por pregador com cache
     */
    async findBySpeaker(speaker) {
        const cacheKey = `${this.cachePrefix}:speaker:${speaker}`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.sermonService.findBySpeaker(speaker),
            this.cacheService.getTTLForType('filter')
        );
    }

    /**
     * Busca estatísticas com cache
     */
    async getStats() {
        const cacheKey = `${this.cachePrefix}:stats:general`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.sermonService.getStats(),
            this.cacheService.getTTLForType('stats')
        );
    }

    /**
     * Busca todas as séries com cache
     */
    async getAllSeries() {
        const cacheKey = `${this.cachePrefix}:series:all`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.sermonService.getAllSeries(),
            this.cacheService.getTTLForType('stats')
        );
    }

    /**
     * Busca todos os pregadores com cache
     */
    async getAllSpeakers() {
        const cacheKey = `${this.cachePrefix}:speakers:all`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.sermonService.getAllSpeakers(),
            this.cacheService.getTTLForType('stats')
        );
    }

    /**
     * Busca todos os livros com cache
     */
    async getAllBooks() {
        const cacheKey = `${this.cachePrefix}:books:all`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.sermonService.getAllBooks(),
            this.cacheService.getTTLForType('stats')
        );
    }

    /**
     * Aquece cache com dados frequentemente acessados
     */
    async warmUp() {
        console.log('🔥 Aquecendo cache dos sermões...');

        try {
            const warmUpPromises = [
                this.getStats(),
                this.getAllSeries(),
                this.getAllSpeakers(),
                this.getAllBooks(),
                this.findLatest(),
                this.findAll({ page: 1, limit: 10 })
            ];

            await Promise.allSettled(warmUpPromises);
            console.log('✅ Cache dos sermões aquecido com sucesso');
        } catch (error) {
            console.error('❌ Erro ao aquecer cache dos sermões:', error.message);
        }
    }

    /**
     * Status do cache para sermões
     */
    async getCacheStatus() {
        const patterns = [
            `${this.cachePrefix}:*`
        ];

        const keys = [];
        for (const pattern of patterns) {
            const patternKeys = await this.cacheService.redis.keys(pattern);
            keys.push(...patternKeys);
        }

        return {
            service: 'SermonService',
            totalKeys: keys.length,
            patterns: patterns,
            sampleKeys: keys.slice(0, 10)
        };
    }
}

module.exports = new CachedSermonService();
