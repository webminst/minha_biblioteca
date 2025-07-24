// backend/services/CachedStudyService.js
const StudyService = require('./StudyService');
const CacheService = require('./CacheService');

/**
 * Wrapper do StudyService com funcionalidades de cache
 * Mantém toda a interface original do StudyService
 */
class CachedStudyService {
    constructor() {
        this.studyService = StudyService;
        this.cacheService = CacheService;
        this.cachePrefix = 'study';
    }

    /**
     * Busca todos os estudos com cache
     */
    async findAll(options = {}) {
        // Garante que page e limit são números
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        // Cria uma chave de cache única para cada combinação de filtros e paginação
        const filtersKey = [
            `page:${page}`,
            `limit:${limit}`,
            options.sortBy ? `sortBy:${options.sortBy}` : '',
            options.sortOrder ? `sortOrder:${options.sortOrder}` : '',
            options.theme ? `theme:${options.theme}` : '',
            options.format ? `format:${options.format}` : '',
            options.series ? `series:${options.series}` : '',
            options.speaker ? `speaker:${options.speaker}` : '',
            options.search ? `search:${options.search}` : ''
        ].filter(Boolean).join('|');
        const cacheKey = `${this.cachePrefix}:list:${filtersKey}`;
        const result = await this.cacheService.getOrSet(
            cacheKey,
            () => this.studyService.findAll({ ...options, page, limit }),
            this.cacheService.getTTLForType('list')
        );
        // Garante que o campo total está presente para a rota usar corretamente
        if (result && result.pagination && typeof result.pagination.total === 'number') {
            result.total = result.pagination.total;
        }
        return result;
    }

    /**
     * Busca estudo por ID com cache
     */
    async findById(id) {
        const cacheKey = `${this.cachePrefix}:detail:${id}`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.studyService.findById(id),
            this.cacheService.getTTLForType('detail')
        );
    }

    /**
     * Busca último estudo com cache
     */
    async findLatest() {
        const cacheKey = `${this.cachePrefix}:latest`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.studyService.findLatest(),
            this.cacheService.getTTLForType('stats')
        );
    }

    /**
     * Cria novo estudo e invalida cache relevante
     */
    async create(studyData, userId) {
        const result = await this.studyService.create(studyData, userId);

        // Invalida caches relacionados
        await Promise.all([
            this.cacheService.invalidatePattern(`${this.cachePrefix}:list*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:stats*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:latest*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:themes*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:formats*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:series*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:speakers*`)
        ]);

        console.log('🗑️ Cache invalidado após criação de estudo');
        return result;
    }

    /**
     * Atualiza estudo e invalida cache relevante
     */
    async update(id, updateData, userId) {
        const result = await this.studyService.update(id, updateData, userId);

        // Invalida caches relacionados
        await Promise.all([
            this.cacheService.invalidatePattern(`${this.cachePrefix}:detail:${id}`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:list*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:stats*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:latest*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:themes*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:formats*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:series*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:speakers*`)
        ]);

        console.log(`🗑️ Cache invalidado após atualização do estudo ${id}`);
        return result;
    }

    /**
     * Exclui estudo e invalida cache relevante
     */
    async delete(id) {
        const result = await this.studyService.delete(id);

        // Invalida caches relacionados
        await Promise.all([
            this.cacheService.invalidatePattern(`${this.cachePrefix}:detail:${id}`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:list*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:stats*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:latest*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:themes*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:formats*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:series*`),
            this.cacheService.invalidatePattern(`${this.cachePrefix}:speakers*`)
        ]);

        console.log(`🗑️ Cache invalidado após exclusão do estudo ${id}`);
        return result;
    }

    /**
     * Busca estudos por tema com cache
     */
    async findByTheme(theme) {
        const cacheKey = `${this.cachePrefix}:theme:${theme}`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.studyService.findByTheme(theme),
            this.cacheService.getTTLForType('filter')
        );
    }

    /**
     * Busca estudos por formato com cache
     */
    async findByFormat(format) {
        const cacheKey = `${this.cachePrefix}:format:${format}`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.studyService.findByFormat(format),
            this.cacheService.getTTLForType('filter')
        );
    }

    /**
     * Busca estudos por série com cache
     */
    async findBySeries(series) {
        const cacheKey = `${this.cachePrefix}:series:${series}`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.studyService.findBySeries(series),
            this.cacheService.getTTLForType('filter')
        );
    }

    /**
     * Busca estudos por pregador com cache
     */
    async findBySpeaker(speaker) {
        const cacheKey = `${this.cachePrefix}:speaker:${speaker}`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.studyService.findBySpeaker(speaker),
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
            () => this.studyService.getStats(),
            this.cacheService.getTTLForType('stats')
        );
    }

    /**
     * Busca todos os temas com cache
     */
    async getAllThemes() {
        const cacheKey = `${this.cachePrefix}:themes:all`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.studyService.getAllThemes(),
            this.cacheService.getTTLForType('stats')
        );
    }

    /**
     * Busca todos os formatos com cache
     */
    async getAllFormats() {
        const cacheKey = `${this.cachePrefix}:formats:all`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.studyService.getAllFormats(),
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
            () => this.studyService.getAllSeries(),
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
            () => this.studyService.getAllSpeakers(),
            this.cacheService.getTTLForType('stats')
        );
    }

    /**
     * Busca estudos populares com cache
     */
    async findPopular() {
        const cacheKey = `${this.cachePrefix}:popular`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.studyService.findPopular(),
            this.cacheService.getTTLForType('stats')
        );
    }

    /**
     * Busca todas as referências com cache
     */
    async getAllReferences() {
        const cacheKey = `${this.cachePrefix}:references:all`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.studyService.getAllReferences(),
            this.cacheService.getTTLForType('stats')
        );
    }

    /**
     * Busca estudos relacionados com cache
     */
    async findRelated(id) {
        const cacheKey = `${this.cachePrefix}:related:${id}`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.studyService.findRelated(id),
            this.cacheService.getTTLForType('filter')
        );
    }

    /**
     * Busca sugestões de estudos com base em um termo de busca, com cache
     * @param {string} term - Termo de busca
     * @param {number} limit - Limite de sugestões por categoria
     * @returns {Object} - Objeto com sugestões agrupadas por categoria
     */
    async findSuggestions(term, limit = 5) {
        // Se o termo for muito curto, retorna vazio sem cache
        if (!term || term.trim().length < 2) {
            return {
                titles: [],
                themes: [],
                references: [],
                formats: []
            };
        }

        const searchTerm = term.trim().toLowerCase();
        const cacheKey = `${this.cachePrefix}:suggestions:${searchTerm}:${limit}`;

        return await this.cacheService.getOrSet(
            cacheKey,
            () => this.studyService.findSuggestions(searchTerm, limit),
            this.cacheService.getTTLForType('suggestions'),
            // Invalida o cache se houver alguma alteração nos dados
            [`${this.cachePrefix}:list*`, `${this.cachePrefix}:stats*`]
        );
    }

    /**
     * Aquece cache com dados frequentemente acessados
     */
    async warmUp() {
        console.log('🔥 Aquecendo cache dos estudos...');

        try {
            const tasks = [
                () => this.getStats(),
                () => this.getAllThemes(),
                () => this.getAllFormats(),
                () => this.getAllSeries(),
                () => this.getAllSpeakers(),
                () => this.findLatest(),
                () => this.findAll({ limit: 10, page: 1 })
            ];

            // Executa todas as operações de warm-up
            await Promise.all(tasks.map(task => task().catch(err => {
                console.error('Erro no warm-up:', err.message);
            })));

            console.log('✅ Cache dos estudos aquecido com sucesso');
        } catch (error) {
            console.error('❌ Erro no warm-up dos estudos:', error.message);
        }
    }
}

module.exports = new CachedStudyService();
