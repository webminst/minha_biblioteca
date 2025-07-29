// backend/services/SermonService.js
const Sermon = require('../models/Sermon');
const { AppError } = require('../middleware/errorHandler');

/**
 * Serviço para gerenciamento de sermões
 * Centraliza toda a lógica de negócio relacionada aos sermões
 */
class SermonService {

    /**
     * Busca todos os sermões com paginação e filtros
     * @param {Object} options - Opções de busca
     * @returns {Object} - Sermões paginados
     */
    async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'date',
            sortOrder = 'desc',
            book,
            series,
            speaker,
            search
        } = options;

        // Constrói filtros
        const filters = {};
        if (book) filters.book = { $regex: book, $options: 'i' };
        if (series) filters.series = { $regex: series, $options: 'i' };
        if (speaker) filters.speaker = { $regex: speaker, $options: 'i' };

        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: 'i' } },
                { bibleReference: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { series: { $regex: search, $options: 'i' } }
            ];
        }

        // Configuração de ordenação
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Executa busca paginada
        const skip = (page - 1) * limit;

        const [sermons, total] = await Promise.all([
            Sermon.find(filters)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .select('title bibleReference series description tags date createdAt updatedAt'),
            Sermon.countDocuments(filters)
        ]);

        return {
            sermons,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            filters: {
                book,
                series,
                speaker,
                search
            }
        };
    }

    /**
     * Busca sermão por ID
     * @param {string} id - ID do sermão
     * @returns {Object} - Sermão encontrado
     */
    async findById(id) {
        const sermon = await Sermon.findById(id);

        if (!sermon) {
            throw new AppError('Sermão não encontrado', 404);
        }

        return sermon;
    }

    /**
     * Busca o último sermão criado
     * @returns {Object} - Último sermão
     */
    async findLatest() {
        const sermon = await Sermon.findOne()
            .sort({ createdAt: -1 })
            .select('title bibleReference series description date');

        if (!sermon) {
            throw new AppError('Nenhum sermão encontrado', 404);
        }

        return sermon;
    }

    /**
     * Busca sugestões de busca baseadas em um termo
     * @param {string} term - Termo de busca
     * @param {number} limit - Limite de sugestões
     * @returns {Array} - Lista de sugestões
     */
    /**
     * Busca sugestões de busca baseadas em um termo
     * @param {string} term - Termo de busca
     * @param {number} limit - Limite de sugestões
     * @returns {Array} - Lista de sugestões no formato de string
     */
    async findSuggestions(term, limit = 5) {
        if (!term || term.length < 2) {
            return [];
        }

        const regex = new RegExp(term, 'i');

        // Busca em múltiplos campos usando agregação para obter resultados únicos
        const suggestions = await Sermon.aggregate([
            {
                $match: {
                    $or: [
                        { title: { $regex: regex } },
                        { bibleReference: { $regex: regex } },
                        { series: { $regex: regex } },
                        { speaker: { $regex: regex } },
                        { book: { $regex: regex } }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    title: 1,
                    bibleReference: 1,
                    series: 1,
                    speaker: 1,
                    book: 1,
                    // Cria um campo de pontuação baseado na relevância
                    score: {
                        $add: [
                            { $cond: [{ $regexMatch: { input: "$title", regex: regex } }, 10, 0] },
                            { $cond: [{ $regexMatch: { input: "$bibleReference", regex: regex } }, 8, 0] },
                            { $cond: [{ $regexMatch: { input: "$series", regex: regex } }, 6, 0] },
                            { $cond: [{ $regexMatch: { input: "$speaker", regex: regex } }, 4, 0] },
                            { $cond: [{ $regexMatch: { input: "$book", regex: regex } }, 2, 0] }
                        ]
                    }
                }
            },
            { $sort: { score: -1 } },
            { $limit: limit },
            {
                $project: {
                    text: {
                        $cond: {
                            if: { $and: [{ $gt: ["$title", null] }, { $regexMatch: { input: "$title", regex: regex } }] },
                            then: "$title",
                            else: {
                                $cond: {
                                    if: { $and: [{ $gt: ["$bibleReference", null] }, { $regexMatch: { input: "$bibleReference", regex: regex } }] },
                                    then: "$bibleReference",
                                    else: {
                                        $cond: {
                                            if: { $and: [{ $gt: ["$series", null] }, { $regexMatch: { input: "$series", regex: regex } }] },
                                            then: "$series",
                                            else: {
                                                $cond: {
                                                    if: { $and: [{ $gt: ["$speaker", null] }, { $regexMatch: { input: "$speaker", regex: regex } }] },
                                                    then: "$speaker",
                                                    else: "$book"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        // Extrai apenas o campo 'text' de cada sugestão e remove duplicatas
        const uniqueSuggestions = [...new Set(suggestions.map(s => s.text))];

        return uniqueSuggestions.filter(Boolean); // Remove valores nulos ou vazios
    }

    /**
     * Cria novo sermão
     * @param {Object} sermonData - Dados do sermão
     * @param {string} userId - ID do usuário que está criando
     * @returns {Object} - Sermão criado
     */
    async create(sermonData, userId) {
        // Validações de negócio
        if (!sermonData.title) {
            throw new AppError('Título é obrigatório', 400);
        }

        if (!sermonData.bibleReference) {
            throw new AppError('Referência bíblica é obrigatória', 400);
        }

        // Verifica se já existe sermão com mesmo título e referência
        const existingSermon = await Sermon.findOne({
            title: sermonData.title,
            bibleReference: sermonData.bibleReference
        });

        if (existingSermon) {
            throw new AppError('Já existe um sermão com este título e referência bíblica', 409);
        }

        const sermon = new Sermon({
            ...sermonData,
            createdBy: userId
        });

        const savedSermon = await sermon.save();
        return savedSermon;
    }

    /**
     * Atualiza sermão existente
     * @param {string} id - ID do sermão
     * @param {Object} updateData - Dados para atualização
     * @param {string} userId - ID do usuário que está atualizando
     * @returns {Object} - Sermão atualizado
     */
    async update(id, updateData, userId) {
        const sermon = await Sermon.findById(id);

        if (!sermon) {
            throw new AppError('Sermão não encontrado', 404);
        }

        // Se fornecido título e referência, verifica duplicação
        if (updateData.title && updateData.bibleReference) {
            const existingSermon = await Sermon.findOne({
                _id: { $ne: id }, // Exclui o sermão atual da busca
                title: updateData.title,
                bibleReference: updateData.bibleReference
            });

            if (existingSermon) {
                throw new AppError('Já existe outro sermão com este título e referência bíblica', 409);
            }
        }

        const updatedSermon = await Sermon.findByIdAndUpdate(
            id,
            {
                ...updateData,
                updatedBy: userId,
                updatedAt: new Date()
            },
            {
                new: true,
                runValidators: true
            }
        );

        return updatedSermon;
    }

    /**
     * Exclui sermão
     * @param {string} id - ID do sermão
     * @returns {Object} - Sermão excluído
     */
    async delete(id) {
        const sermon = await Sermon.findById(id);

        if (!sermon) {
            throw new AppError('Sermão não encontrado', 404);
        }

        await Sermon.findByIdAndDelete(id);

        return {
            message: 'Sermão excluído com sucesso',
            deletedSermon: {
                _id: sermon._id,
                title: sermon.title
            }
        };
    }

    /**
     * Busca sermões por série
     * @param {string} series - Nome da série
     * @returns {Array} - Sermões da série
     */
    async findBySeries(series) {
        const sermons = await Sermon.findBySeries(series);
        return sermons;
    }

    /**
     * Busca sermões por pregador
     * @param {string} speaker - Nome do pregador
     * @returns {Array} - Sermões do pregador
     */
    async findBySpeaker(speaker) {
        const sermons = await Sermon.findBySpeaker(speaker);
        return sermons;
    }

    /**
     * Busca estatísticas dos sermões
     * @returns {Object} - Estatísticas
     */
    async getStats() {
        const stats = await Sermon.aggregate([
            {
                $group: {
                    _id: null,
                    totalSermons: { $sum: 1 },
                    totalSeries: { $addToSet: '$series' },
                    totalSpeakers: { $addToSet: '$speaker' },
                    avgDescriptionLength: { $avg: { $strLenCP: '$description' } },
                    mostRecentDate: { $max: '$date' },
                    oldestDate: { $min: '$date' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSermons: 1,
                    totalSeries: { $size: '$totalSeries' },
                    totalSpeakers: { $size: '$totalSpeakers' },
                    avgDescriptionLength: { $round: ['$avgDescriptionLength', 0] },
                    mostRecentDate: 1,
                    oldestDate: 1
                }
            }
        ]);

        return stats[0] || {
            totalSermons: 0,
            totalSeries: 0,
            totalSpeakers: 0,
            avgDescriptionLength: 0,
            mostRecentDate: null,
            oldestDate: null
        };
    }

    /**
     * Busca todas as séries únicas
     * @returns {Array} - Lista de séries
     */
    async getAllSeries() {
        const series = await Sermon.distinct('series');
        return series.filter(s => s && s.trim() !== '');
    }

    /**
     * Busca todos os pregadores únicos
     * @returns {Array} - Lista de pregadores
     */
    async getAllSpeakers() {
        const speakers = await Sermon.distinct('speaker');
        return speakers.filter(s => s && s.trim() !== '');
    }

    /**
     * Busca todos os livros únicos
     * @returns {Array} - Lista de livros
     */
    async getAllBooks() {
        const books = await Sermon.distinct('book');
        return books.filter(b => b && b.trim() !== '');
    }

    /**
     * Busca sugestões de busca em todo o banco de dados
     * @param {string} term - Termo de busca
     * @param {number} [limit=5] - Limite de sugestões
     * @returns {Promise<Array>} - Lista de sugestões
     */
    async findSuggestions(term, limit = 5) {
        if (!term || term.length < 2) {
            return [];
        }

        try {
            const searchRegex = new RegExp(term, 'i');
            console.log(`🔍 Buscando sugestões para o termo: ${term}`);

            // Usa aggregation para buscar todas as sugestões em uma única consulta
            const results = await Sermon.aggregate([
                {
                    $match: {
                        $or: [
                            { title: searchRegex },
                            { series: { $exists: true, $ne: null, $regex: searchRegex } },
                            { book: { $exists: true, $ne: null, $regex: searchRegex } },
                            { speaker: { $exists: true, $ne: null, $regex: searchRegex } }
                        ]
                    }
                },
                {
                    $project: {
                        _id: 0,
                        title: 1,
                        series: 1,
                        book: 1,
                        speaker: 1
                    }
                },
                {
                    $limit: 20 // Busca mais itens para garantir variedade
                }
            ]);

            // Combina e remove duplicatas
            const suggestions = new Set();

            // Adiciona sugestões de cada campo
            results.forEach(item => {
                if (item.title && item.title.match(searchRegex)) {
                    suggestions.add(item.title);
                }
                if (item.series && item.series.match(searchRegex)) {
                    suggestions.add(item.series);
                }
                if (item.book && item.book.match(searchRegex)) {
                    suggestions.add(item.book);
                }
                if (item.speaker && item.speaker.match(searchRegex)) {
                    suggestions.add(item.speaker);
                }

                // Limita o número de itens processados se já tivermos sugestões suficientes
                if (suggestions.size >= limit * 2) {
                    return; // Sai do forEach
                }
            });

            // Converte para array, ordena por relevância (tamanho do termo) e limita
            const sortedSuggestions = Array.from(suggestions)
                .sort((a, b) => {
                    // Prioriza termos mais curtos (mais relevantes)
                    const aScore = a.length;
                    const bScore = b.length;
                    return aScore - bScore;
                })
                .slice(0, limit);

            console.log(`✅ ${sortedSuggestions.length} sugestões encontradas para: ${term}`);
            return sortedSuggestions;

        } catch (error) {
            console.error('❌ Erro ao buscar sugestões:', error);
            return []; // Retorna array vazio em caso de erro
        }
    }

    /**
     * Busca os livros bíblicos únicos
     * @returns {Promise<Array>} - Lista de livros bíblicos únicos
     */
    async findUniqueBooks() {
        return await Sermon.distinct('book');
    }

}

module.exports = new SermonService();
