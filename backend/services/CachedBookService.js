// backend/services/CachedBookService.js
const BookService = require('./BookService');
const cacheService = require('./CacheService');

/**
 * 🚀 Book Service com Cache Redis
 * Wrapper do BookService original com cache inteligente
 */
class CachedBookService extends BookService {

    /**
     * 📚 Busca todos os livros com cache
     */
    async findAll(options = {}) {
        return cacheService.smartCache(
            'books',
            'list',
            () => super.findAll(options),
            {
                params: options,
                type: 'books-list'
            }
        );
    }

    /**
     * 📖 Busca livro por ID com cache
     */
    async findById(id) {
        return cacheService.smartCache(
            'books',
            id,
            () => super.findById(id),
            {
                type: 'book-detail'
            }
        );
    }

    /**
     * 📊 Último livro com cache
     */
    async findLatest() {
        return cacheService.smartCache(
            'books',
            'latest',
            () => super.findLatest(),
            {
                type: 'home-latest'
            }
        );
    }

    /**
     * ➕ Criar livro (invalida caches relacionados)
     */
    async create(bookData, userId) {
        const result = await super.create(bookData, userId);

        // Invalida caches relacionados, incluindo o cache específico do livro criado
        if (result && result._id) {
            await this.invalidateRelatedCaches('create', { id: result._id });
        } else {
            await this.invalidateRelatedCaches('create');
        }

        return result;
    }

    /**
     * ✏️ Atualizar livro (invalida caches relacionados)
     */
    async update(id, updateData, userId) {
        const result = await super.update(id, updateData, userId);

        // Invalida caches relacionados, incluindo o cache específico
        await this.invalidateRelatedCaches('update', { id });

        return result;
    }

    /**
     * 🗑️ Deletar livro (invalida caches relacionados)
     */
    async delete(id) {
        const result = await super.delete(id);

        // Invalida caches relacionados, incluindo o cache específico
        await this.invalidateRelatedCaches('delete', { id });

        return result;
    }

    /**
     * 📊 Estatísticas com cache
     */
    async getStats() {
        return cacheService.smartCache(
            'books',
            'stats',
            () => super.getStats(),
            {
                type: 'stats'
            }
        );
    }

    /**
     * 🔍 Busca livros por área com cache
     */
    async findByArea(area, options = {}) {
        return cacheService.smartCache(
            'books',
            'area',
            () => super.findByArea(area, options),
            {
                params: { area, ...options },
                type: 'books-list'
            }
        );
    }

    /**
     * 👤 Busca livros por autor com cache
     */
    async findByAuthor(author, options = {}) {
        return cacheService.smartCache(
            'books',
            'author',
            () => super.findByAuthor(author, options),
            {
                params: { author, ...options },
                type: 'books-list'
            }
        );
    }

    /**
     * 🏷️ Busca livros por tags com cache
     */
    async findByTags(tags, options = {}) {
        return cacheService.smartCache(
            'books',
            'tags',
            () => super.findByTags(tags, options),
            {
                params: { tags, ...options },
                type: 'books-list'
            }
        );
    }

    /**
     * 🔍 Busca avançada com cache
     */
    async advancedSearch(searchParams, options = {}) {
        return cacheService.smartCache(
            'books',
            'search',
            () => super.advancedSearch(searchParams, options),
            {
                params: { searchParams, ...options },
                type: 'search'
            }
        );
    }

    /**
     * 📋 Busca áreas únicas com cache
     */
    async getUniqueAreas() {
        return cacheService.smartCache(
            'books',
            'areas',
            () => super.getAllAreas(), // CORRIGIDO: método correto
            {
                type: 'filters'
            }
        );
    }

    /**
     * 👥 Busca autores únicos com cache
     */
    async getUniqueAuthors() {
        return cacheService.smartCache(
            'books',
            'authors',
            () => super.getAllAuthors(), // CORRIGIDO: método correto
            {
                type: 'filters'
            }
        );
    }

    /**
     * 🏢 Busca editoras únicas com cache
     */
    async getUniquePublishers() {
        return cacheService.smartCache(
            'books',
            'publishers',
            () => super.getAllPublishers(), // CORRIGIDO: método correto
            {
                type: 'filters'
            }
        );
    }

    /**
     * 🏷️ Busca todas as tags únicas com cache
     */
    async getAllTags() {
        return cacheService.smartCache(
            'books',
            'tags',
            () => super.getAllSeries(), // NOTA: usando getAllSeries como não existe getAllTags
            {
                type: 'filters'
            }
        );
    }

    /**
     * 🧹 Invalida caches relacionados
     * @param {string} operation - Tipo de operação: 'create', 'update', 'delete'
     * @param {Object} [data] - Dados adicionais para invalidação específica
     */
    async invalidateRelatedCaches(operation = 'update', data = {}) {
        console.log(`🧹 Invalidating book caches for operation: ${operation}`, data);

        // Invalida caches específicos de books
        await cacheService.invalidateRelated('books', operation);

        // Invalida caches de listagem, busca e sugestões
        await cacheService.invalidatePattern('books:list*');
        await cacheService.invalidatePattern('books:search*');
        await cacheService.invalidatePattern('books:filters*');
        await cacheService.invalidatePattern('books:suggestions*');

        // Se houver um ID específico, invalida o cache detalhado
        if (data.id) {
            await cacheService.delete(`books:${data.id}`);
        }

        // Invalida caches de estatísticas e home para operações que afetam contadores
        if (['create', 'delete'].includes(operation)) {
            await cacheService.invalidatePattern('stats:*');
            await cacheService.invalidatePattern('home:*');
        }

        // Invalida caches de filtros e listagens relacionadas
        await cacheService.invalidatePattern('books:areas*');
        await cacheService.invalidatePattern('books:authors*');
        await cacheService.invalidatePattern('books:publishers*');
        await cacheService.invalidatePattern('books:tags*');
        
        console.log('✅ Caches de livros invalidados com sucesso');
    }

    /**
     * 🔄 Força refresh do cache
     */
    async refreshCache(type, identifier, options = {}) {
        const { params = {} } = options;

        switch (type) {
            case 'list':
                return cacheService.smartCache(
                    'books', 'list',
                    () => super.findAll(params),
                    { params, type: 'books-list', forceRefresh: true }
                );

            case 'detail':
                return cacheService.smartCache(
                    'books', identifier,
                    () => super.findById(identifier),
                    { type: 'book-detail', forceRefresh: true }
                );

            case 'stats':
                return cacheService.smartCache(
                    'books', 'stats',
                    () => super.getStats(),
                    { type: 'stats', forceRefresh: true }
                );
                
            case 'suggestions':
                const { term, limit } = options.params || {};
                if (!term) throw new Error('Termo de busca é obrigatório');
                const cacheKey = `suggestions:${term.toLowerCase()}`;
                return cacheService.smartCache(
                    'books',
                    cacheKey,
                    () => super.findSuggestions(term, limit || 5),
                    { type: 'suggestions', forceRefresh: true, params: { term, limit } }
                );

            default:
                throw new Error(`Tipo de cache não suportado: ${type}`);
        }
    }

    /**
     * 📊 Status do cache para books
     */
    async getCacheStatus() {
        const keys = await cacheService.redisHelpers?.keys('books:*') || [];
        const stats = cacheService.getStats();

        return {
            service: 'BookService',
            totalCacheKeys: keys.length,
            cacheKeys: keys.slice(0, 10), // Primeiras 10 chaves
            stats
        };
    }

    /**
     * 🔍 Busca sugestões de livros com cache
     */
    async findSuggestions(term, limit = 5) {
        if (!term || term.trim().length < 2) {
            return {
                titles: [],
                authors: [],
                areas: [],
                publishers: []
            };
        }

        const cacheKey = `suggestions:${term.toLowerCase()}`;
        
        return cacheService.smartCache(
            'books',
            cacheKey,
            () => super.findSuggestions(term, limit),
            {
                type: 'suggestions',
                ttl: 1800, // 30 minutos de cache para sugestões
                params: { term, limit }
            }
        );
    }

    /**
     * 🧪 Warm up cache (pré-aquece com dados mais acessados)
     */
    async warmUpCache() {
        console.log('🔥 Warming up BookService cache...');

        try {
            // Dados mais acessados
            const warmUpTasks = [
                // Últimos livros
                this.findLatest(),

                // Estatísticas
                this.getStats(),

                // Filtros comuns
                this.getUniqueAreas(),
                this.getUniqueAuthors(),
                this.getAllTags(),

                // Lista padrão (primeira página)
                this.findAll({ page: 1, limit: 10 })
            ];

            await Promise.allSettled(warmUpTasks);
            console.log('✅ BookService cache warmed up successfully');

        } catch (error) {
            console.error('❌ Error warming up BookService cache:', error.message);
        }
    }
}

module.exports = new CachedBookService();
