// dto/sermons/SermonDTO.js
const Joi = require('joi');
const BaseDTO = require('../BaseDTO');

/**
 * DTO para criação de sermões
 */
class CreateSermonDTO extends BaseDTO {
    constructor(data) {
        super(data);
        this.schema = Joi.object({
            // Informações básicas
            title: Joi.string()
                .required()
                .trim()
                .min(5)
                .max(200)
                .messages({
                    'string.empty': 'Título é obrigatório',
                    'string.min': 'Título deve ter pelo menos 5 caracteres',
                    'string.max': 'Título não pode exceder 200 caracteres'
                }),

            // Referência bíblica
            biblicalReference: Joi.string()
                .required()
                .trim()
                .min(3)
                .max(100)
                .messages({
                    'string.empty': 'Referência bíblica é obrigatória',
                    'string.min': 'Referência bíblica deve ter pelo menos 3 caracteres'
                }),

            book: Joi.string()
                .required()
                .trim()
                .min(2)
                .max(50)
                .messages({
                    'string.empty': 'Livro bíblico é obrigatório'
                }),

            chapter: Joi.number()
                .integer()
                .positive()
                .required()
                .messages({
                    'number.base': 'Capítulo deve ser um número',
                    'number.positive': 'Capítulo deve ser um número positivo'
                }),

            startVerse: Joi.number()
                .integer()
                .positive()
                .required()
                .messages({
                    'number.positive': 'Versículo inicial deve ser positivo'
                }),

            endVerse: Joi.number()
                .integer()
                .positive()
                .optional()
                .greater(Joi.ref('startVerse'))
                .messages({
                    'number.greater': 'Versículo final deve ser maior que o inicial'
                }),

            // Conteúdo
            summary: Joi.string()
                .required()
                .trim()
                .min(20)
                .max(1000)
                .messages({
                    'string.empty': 'Resumo é obrigatório',
                    'string.min': 'Resumo deve ter pelo menos 20 caracteres',
                    'string.max': 'Resumo não pode exceder 1000 caracteres'
                }),

            content: Joi.string()
                .required()
                .trim()
                .min(100)
                .max(50000)
                .messages({
                    'string.empty': 'Conteúdo do sermão é obrigatório',
                    'string.min': 'Conteúdo deve ter pelo menos 100 caracteres',
                    'string.max': 'Conteúdo não pode exceder 50000 caracteres'
                }),

            outline: Joi.array()
                .items(
                    Joi.object({
                        point: Joi.string().required().trim().min(5).max(200),
                        subPoints: Joi.array()
                            .items(Joi.string().trim().min(3).max(200))
                            .max(10)
                            .default([]),
                        scripture: Joi.string().trim().max(100).optional()
                    })
                )
                .max(20)
                .default([])
                .messages({
                    'array.max': 'Máximo de 20 pontos no esboço permitidos'
                }),

            keyVerses: Joi.array()
                .items(
                    Joi.object({
                        reference: Joi.string().required().trim().max(50),
                        text: Joi.string().required().trim().max(1000),
                        version: Joi.string().trim().max(20).default('ARA')
                    })
                )
                .max(10)
                .default([])
                .messages({
                    'array.max': 'Máximo de 10 versículos-chave permitidos'
                }),

            // Categorização
            category: Joi.string()
                .valid(
                    'Expositivo',
                    'Temático',
                    'Evangelístico',
                    'Doutrinário',
                    'Devocional',
                    'Ocasião Especial',
                    'Série',
                    'Outros'
                )
                .default('Temático'),

            tags: Joi.array()
                .items(BaseDTO.commonValidations.tag)
                .max(10)
                .default([])
                .messages({
                    'array.max': 'Máximo de 10 tags permitidas'
                }),

            audience: Joi.string()
                .valid('Geral', 'Jovens', 'Adultos', 'Crianças', 'Idosos', 'Líderes')
                .default('Geral'),

            // Metadados
            preachedDate: Joi.date()
                .max('now')
                .optional()
                .messages({
                    'date.max': 'Data de pregação não pode ser futura'
                }),

            duration: Joi.number()
                .integer()
                .positive()
                .max(300) // máximo 5 horas em minutos
                .optional()
                .messages({
                    'number.max': 'Duração não pode exceder 300 minutos'
                }),

            series: Joi.string()
                .optional()
                .trim()
                .max(100)
                .allow('')
                .messages({
                    'string.max': 'Nome da série não pode exceder 100 caracteres'
                }),

            seriesOrder: Joi.number()
                .integer()
                .positive()
                .optional()
                .messages({
                    'number.positive': 'Ordem na série deve ser positiva'
                }),

            // Recursos adicionais
            audioUrl: BaseDTO.commonValidations.url.optional(),
            videoUrl: BaseDTO.commonValidations.url.optional(),
            slidesUrl: BaseDTO.commonValidations.url.optional(),
            notesUrl: BaseDTO.commonValidations.url.optional(),

            // Status
            isPublished: Joi.boolean().default(true),
            featured: Joi.boolean().default(false),

            // Ocasião especial
            occasion: Joi.string()
                .optional()
                .trim()
                .max(100)
                .allow('')
                .messages({
                    'string.max': 'Ocasião não pode exceder 100 caracteres'
                })
        });
    }

    transform() {
        const data = this.validatedData || this.data;

        // Normaliza tags
        if (data.tags && data.tags.length > 0) {
            data.tags = [...new Set(data.tags.map(tag => tag.toLowerCase().trim()))];
        }

        // Constrói referência bíblica completa se não fornecida
        if (!data.biblicalReference && data.book && data.chapter && data.startVerse) {
            const endVerse = data.endVerse ? `-${data.endVerse}` : '';
            data.biblicalReference = `${data.book} ${data.chapter}:${data.startVerse}${endVerse}`;
        }

        // Garante arrays padrão
        data.outline = data.outline || [];
        data.keyVerses = data.keyVerses || [];

        return data;
    }
}

/**
 * DTO para atualização de sermões
 */
class UpdateSermonDTO extends BaseDTO {
    constructor(data) {
        super(data);

        const createSchema = new CreateSermonDTO({}).schema;
        this.schema = createSchema.fork(
            Object.keys(createSchema.describe().keys),
            (schema) => schema.optional()
        ).min(1);
    }

    transform() {
        const data = this.validatedData || this.data;

        if (data.tags && data.tags.length > 0) {
            data.tags = [...new Set(data.tags.map(tag => tag.toLowerCase().trim()))];
        }

        return data;
    }
}

/**
 * DTO para resposta de sermão
 */
class SermonResponseDTO extends BaseDTO {
    constructor(data) {
        super(data);
        this.schema = Joi.object({
            _id: BaseDTO.commonValidations.id,
            title: Joi.string(),
            biblicalReference: Joi.string(),
            book: Joi.string(),
            chapter: Joi.number(),
            startVerse: Joi.number(),
            endVerse: Joi.number(),
            summary: Joi.string(),
            content: Joi.string(),
            outline: Joi.array(),
            keyVerses: Joi.array(),
            category: Joi.string(),
            tags: Joi.array().items(Joi.string()),
            audience: Joi.string(),
            preachedDate: Joi.date(),
            duration: Joi.number(),
            series: Joi.string().allow(''),
            seriesOrder: Joi.number(),
            audioUrl: Joi.string().allow(''),
            videoUrl: Joi.string().allow(''),
            slidesUrl: Joi.string().allow(''),
            notesUrl: Joi.string().allow(''),
            isPublished: Joi.boolean(),
            featured: Joi.boolean(),
            occasion: Joi.string().allow(''),
            views: Joi.number(),
            likes: Joi.number(),
            createdAt: Joi.date(),
            updatedAt: Joi.date(),
            createdBy: BaseDTO.commonValidations.id
        }).unknown(true);
    }

    toPublicObject() {
        const data = this.validatedData || this.data;

        return {
            id: data._id,
            title: data.title,
            biblicalReference: data.biblicalReference,
            book: data.book,
            chapter: data.chapter,
            startVerse: data.startVerse,
            endVerse: data.endVerse || null,
            summary: data.summary,
            content: data.content,
            outline: data.outline || [],
            keyVerses: data.keyVerses || [],
            category: data.category,
            tags: data.tags || [],
            audience: data.audience,
            preachedDate: data.preachedDate || null,
            duration: data.duration || null,
            series: data.series || null,
            seriesOrder: data.seriesOrder || null,
            audioUrl: data.audioUrl || null,
            videoUrl: data.videoUrl || null,
            slidesUrl: data.slidesUrl || null,
            notesUrl: data.notesUrl || null,
            isPublished: data.isPublished,
            featured: data.featured || false,
            occasion: data.occasion || null,
            views: data.views || 0,
            likes: data.likes || 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }

    toSummaryObject() {
        const data = this.validatedData || this.data;

        return {
            id: data._id,
            title: data.title,
            biblicalReference: data.biblicalReference,
            category: data.category,
            audience: data.audience,
            tags: data.tags?.slice(0, 3) || [],
            summary: data.summary?.substring(0, 150) + '...' || '',
            preachedDate: data.preachedDate || null,
            duration: data.duration || null,
            series: data.series || null,
            featured: data.featured || false,
            views: data.views || 0,
            createdAt: data.createdAt
        };
    }
}

/**
 * DTO para busca de sermões
 */
class SermonSearchDTO extends BaseDTO {
    constructor(data) {
        super(data);
        this.schema = Joi.object({
            // Paginação
            ...BaseDTO.commonValidations.pagination,

            // Filtros específicos
            category: Joi.string()
                .valid(
                    'Expositivo',
                    'Temático',
                    'Evangelístico',
                    'Doutrinário',
                    'Devocional',
                    'Ocasião Especial',
                    'Série',
                    'Outros'
                )
                .optional(),

            audience: Joi.string()
                .valid('Geral', 'Jovens', 'Adultos', 'Crianças', 'Idosos', 'Líderes')
                .optional(),

            book: Joi.string().trim().max(50).optional(),
            series: Joi.string().trim().max(100).optional(),

            // Busca
            search: BaseDTO.commonValidations.search.optional(),
            tags: Joi.array()
                .items(BaseDTO.commonValidations.tag)
                .max(5)
                .optional(),

            // Filtros de data
            fromDate: Joi.date().optional(),
            toDate: Joi.date().optional(),

            // Filtros booleanos
            featured: Joi.boolean().optional(),
            published: Joi.boolean().optional(),

            // Filtros específicos de sermão
            hasAudio: Joi.boolean().optional(),
            hasVideo: Joi.boolean().optional(),
            hasSlides: Joi.boolean().optional()
        });
    }

    transform() {
        const data = this.validatedData || this.data;

        if (data.fromDate && data.toDate && data.fromDate > data.toDate) {
            throw new Error('Data inicial não pode ser posterior à data final');
        }

        return data;
    }
}

module.exports = {
    CreateSermonDTO,
    UpdateSermonDTO,
    SermonResponseDTO,
    SermonSearchDTO
};
