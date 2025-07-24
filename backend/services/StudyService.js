// backend/services/StudyService.js
const Study = require('../models/Study');
const { AppError } = require('../middleware/errorHandler');

/**
 * Serviço para gerenciamento de estudos bíblicos
 * Centraliza toda a lógica de negócio relacionada aos estudos
 */
class StudyService {

    /**
     * Busca todos os estudos com paginação e filtros
     * @param {Object} options - Opções de busca
     * @returns {Object} - Estudos paginados
     */
    async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            theme,
            format,
            series,
            speaker,
            search
        } = options;

        // Constrói filtros
        const filters = {};
        if (theme) filters.theme = { $regex: theme, $options: 'i' };
        if (format) filters.format = { $regex: format, $options: 'i' };
        if (series) filters.series = { $regex: series, $options: 'i' };
        if (speaker) filters.speaker = { $regex: speaker, $options: 'i' };

        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: 'i' } },
                { reference: { $regex: search, $options: 'i' } },
                { theme: { $regex: search, $options: 'i' } },
                { format: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Configuração de ordenação
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Executa busca paginada
        const skip = (page - 1) * limit;

        const [studies, total] = await Promise.all([
            Study.find(filters)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .select('title reference theme format description tags createdAt updatedAt'),
            Study.countDocuments(filters)
        ]);

        return {
            studies,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            filters: {
                theme,
                format,
                series,
                speaker,
                search
            }
        };
    }

    /**
     * Busca estudo por ID
     * @param {string} id - ID do estudo
     * @returns {Object} - Estudo encontrado
     */
    async findById(id) {
        const study = await Study.findById(id);

        if (!study) {
            throw new AppError('Estudo não encontrado', 404);
        }

        return study;
    }

    /**
     * Busca o último estudo criado
     * @returns {Object} - Último estudo
     */
    async findLatest() {
        const study = await Study.findOne()
            .sort({ createdAt: -1 })
            .select('title reference theme format description');

        if (!study) {
            throw new AppError('Nenhum estudo encontrado', 404);
        }

        return study;
    }

    /**
     * Cria novo estudo
     * @param {Object} studyData - Dados do estudo
     * @param {string} userId - ID do usuário que está criando
     * @returns {Object} - Estudo criado
     */
    async create(studyData, userId) {
        if (!studyData) {
            console.error('ERRO: studyData está undefined no StudyService.create!');
            throw new AppError('Dados do estudo não recebidos pelo backend.', 500);
        }
        // Validações de negócio
        if (!studyData.title) {
            throw new AppError('Título é obrigatório', 400);
        }

        if (!studyData.theme) {
            throw new AppError('Tema é obrigatório', 400);
        }

        // Verifica se já existe estudo com mesmo título e tema
        const existingStudy = await Study.findOne({
            title: studyData.title,
            theme: studyData.theme
        });

        if (existingStudy) {
            throw new AppError('Já existe um estudo com este título e tema', 409);
        }

        // Mapeia biblicalReference para reference, se presente
        const referenceValue = studyData.biblicalReference || studyData.reference || '';
        if (!referenceValue) {
            throw new AppError('Referência bíblica é obrigatória', 400);
        }
        const studyToSave = {
            ...studyData,
            reference: referenceValue,
            createdBy: userId
        };
        // Remove biblicalReference do objeto salvo, se existir
        delete studyToSave.biblicalReference;

        try {
            const study = new Study(studyToSave);
            const savedStudy = await study.save();
            return savedStudy;
        } catch (err) {
            console.error('Erro ao salvar estudo no MongoDB:', err.message, err.errors || err);
            throw new AppError('Erro ao salvar estudo: ' + (err.message || 'Erro desconhecido'), 400);
        }
    }

    /**
     * Atualiza estudo existente
     * @param {string} id - ID do estudo
     * @param {Object} updateData - Dados para atualização
     * @param {string} userId - ID do usuário que está atualizando
     * @returns {Object} - Estudo atualizado
     */
    async update(id, updateData, userId) {
        const study = await Study.findById(id);

        if (!study) {
            throw new AppError('Estudo não encontrado', 404);
        }

        // Se fornecido título e tema, verifica duplicação
        if (updateData.title && updateData.theme) {
            const existingStudy = await Study.findOne({
                _id: { $ne: id }, // Exclui o estudo atual da busca
                title: updateData.title,
                theme: updateData.theme
            });

            if (existingStudy) {
                throw new AppError('Já existe outro estudo com este título e tema', 409);
            }
        }

        const updatedStudy = await Study.findByIdAndUpdate(
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

        return updatedStudy;
    }

    /**
     * Exclui estudo
     * @param {string} id - ID do estudo
     * @returns {Object} - Estudo excluído
     */
    async delete(id) {
        const study = await Study.findById(id);

        if (!study) {
            throw new AppError('Estudo não encontrado', 404);
        }

        await Study.findByIdAndDelete(id);

        return {
            message: 'Estudo excluído com sucesso',
            deletedStudy: {
                _id: study._id,
                title: study.title
            }
        };
    }

    /**
     * Busca estudos por tema
     * @param {string} theme - Tema do estudo
     * @returns {Array} - Estudos do tema
     */
    async findByTheme(theme) {
        const studies = await Study.find({ theme: { $regex: theme, $options: 'i' } })
            .sort({ createdAt: -1 });
        return studies;
    }

    /**
     * Busca estudos por formato
     * @param {string} format - Formato do estudo
     * @returns {Array} - Estudos do formato
     */
    async findByFormat(format) {
        const studies = await Study.find({ format: { $regex: format, $options: 'i' } })
            .sort({ createdAt: -1 });
        return studies;
    }

    /**
     * Busca estudos por série
     * @param {string} series - Nome da série
     * @returns {Array} - Estudos da série
     */
    async findBySeries(series) {
        const studies = await Study.find({ series: { $regex: series, $options: 'i' } })
            .sort({ createdAt: -1 });
        return studies;
    }

    /**
     * Busca estatísticas dos estudos
     * @returns {Object} - Estatísticas
     */
    async getStats() {
        const stats = await Study.aggregate([
            {
                $group: {
                    _id: null,
                    totalStudies: { $sum: 1 },
                    totalThemes: { $addToSet: '$theme' },
                    totalFormats: { $addToSet: '$format' },
                    totalSeries: { $addToSet: '$series' },
                    totalSpeakers: { $addToSet: '$speaker' },
                    avgDescriptionLength: { $avg: { $strLenCP: '$description' } },
                    mostRecentDate: { $max: '$createdAt' },
                    oldestDate: { $min: '$createdAt' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalStudies: 1,
                    totalThemes: { $size: '$totalThemes' },
                    totalFormats: { $size: '$totalFormats' },
                    totalSeries: { $size: '$totalSeries' },
                    totalSpeakers: { $size: '$totalSpeakers' },
                    avgDescriptionLength: { $round: ['$avgDescriptionLength', 0] },
                    mostRecentDate: 1,
                    oldestDate: 1
                }
            }
        ]);

        return stats[0] || {
            totalStudies: 0,
            totalThemes: 0,
            totalFormats: 0,
            totalSeries: 0,
            totalSpeakers: 0,
            avgDescriptionLength: 0,
            mostRecentDate: null,
            oldestDate: null
        };
    }

    /**
     * Busca todos os temas únicos
     * @returns {Array} - Lista de temas
     */
    async getAllThemes() {
        const themes = await Study.distinct('theme');
        return themes.filter(t => t && t.trim() !== '');
    }

    /**
     * Busca todos os formatos únicos
     * @returns {Array} - Lista de formatos
     */
    async getAllFormats() {
        const formats = await Study.distinct('format');
        return formats.filter(f => f && f.trim() !== '');
    }

    /**
     * Busca todas as séries únicas
     * @returns {Array} - Lista de séries
     */
    async getAllSeries() {
        const series = await Study.distinct('series');
        return series.filter(s => s && s.trim() !== '');
    }

    /**
     * Busca todos os pregadores únicos
     * @returns {Array} - Lista de pregadores
     */
    async getAllSpeakers() {
        const speakers = await Study.distinct('speaker');
        return speakers.filter(s => s && s.trim() !== '');
    }

    /**
     * Busca estudos relacionados por tema ou tags
     * @param {string} studyId - ID do estudo atual
     * @param {number} limit - Limite de resultados
     * @returns {Array} - Estudos relacionados
     */
    async findRelated(studyId, limit = 5) {
        const currentStudy = await this.findById(studyId);

        const relatedStudies = await Study.find({
            _id: { $ne: studyId },
            $or: [
                { theme: currentStudy.theme },
                { tags: { $in: currentStudy.tags || [] } },
                { series: currentStudy.series }
            ]
        })
            .limit(limit)
            .select('title theme format reference description')
            .sort({ createdAt: -1 });

        return relatedStudies;
    }

    /**
     * Busca estudos populares (mais acessados)
     * @param {number} limit - Limite de resultados
     * @returns {Array} - Estudos populares
     */
    async findPopular(limit = 10) {
        // Como não temos campo de visualizações, vamos usar os mais recentes como proxy
        const studies = await Study.find()
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .select('title theme format reference description date');

        return studies;
    }

    /**
     * Busca todas as referências bíblicas únicas
     * @returns {Array} - Lista de referências
     */
    async getAllReferences() {
        const references = await Study.distinct('reference');
        return references.filter(r => r && r.trim() !== '');
    }

    /**
     * Busca sugestões de estudos com base em um termo de busca
     * @param {string} term - Termo de busca
     * @param {number} limit - Limite de sugestões por categoria
     * @returns {Object} - Objeto com sugestões agrupadas por categoria
     */
    async findSuggestions(term, limit = 5) {
        if (!term || term.trim().length < 2) {
            return {
                titles: [],
                themes: [],
                references: [],
                formats: []
            };
        }

        const searchTerm = term.trim().toLowerCase();
        const regex = new RegExp(searchTerm, 'i');

        try {
            // Busca em paralelo por diferentes categorias
            const [titles, themes, references, formats] = await Promise.all([
                // Títulos que contêm o termo
                Study.find({ title: { $regex: regex } })
                    .limit(limit)
                    .select('title')
                    .then(studies => studies.map(s => s.title)),
                
                // Temas que contêm o termo
                Study.find({ theme: { $regex: regex } })
                    .distinct('theme')
                    .then(themes => themes.filter(t => t && t.toLowerCase().includes(searchTerm)))
                    .then(themes => themes.slice(0, limit)),
                
                // Referências que contêm o termo
                Study.find({ reference: { $regex: regex } })
                    .distinct('reference')
                    .then(refs => refs.filter(r => r && r.toLowerCase().includes(searchTerm)))
                    .then(refs => refs.slice(0, limit)),
                
                // Formatos que contêm o termo
                Study.find({ format: { $regex: regex } })
                    .distinct('format')
                    .then(fmts => fmts.filter(f => f && f.toLowerCase().includes(searchTerm)))
                    .then(fmts => fmts.slice(0, limit))
            ]);

            return {
                titles: [...new Set(titles)].slice(0, limit),
                themes: [...new Set(themes)].slice(0, limit),
                references: [...new Set(references)].slice(0, limit),
                formats: [...new Set(formats)].slice(0, limit)
            };
        } catch (error) {
            console.error('Erro ao buscar sugestões de estudos:', error);
            return {
                titles: [],
                themes: [],
                references: [],
                formats: []
            };
        }
    }
}

module.exports = new StudyService();
